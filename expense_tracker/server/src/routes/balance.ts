import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  // Calculate balance from transactions using split_user1_percent
  // User1's share = ROUND(amount_cents * split_user1_percent / 100.0)
  // Positive = User2 owes User1, Negative = User1 owes User2
  const txResult = await pool.query(`
    SELECT COALESCE(SUM(
      CASE WHEN split_mode = 'offset' THEN
        CASE WHEN paid_by = 'user1' THEN
          amount_cents - (ROUND(amount_cents / 2.0) + split_offset_user1_cents)
        ELSE
          -(ROUND(amount_cents / 2.0) + split_offset_user1_cents)
        END
      WHEN split_extra_to IS NOT NULL THEN
        CASE WHEN paid_by = 'user1' THEN
          amount_cents - (FLOOR(amount_cents / 2.0) + CASE WHEN split_extra_to = 'user1' THEN 1 ELSE 0 END)
        ELSE
          -(FLOOR(amount_cents / 2.0) + CASE WHEN split_extra_to = 'user1' THEN 1 ELSE 0 END)
        END
      ELSE
        CASE WHEN paid_by = 'user1' THEN
          amount_cents - ROUND(amount_cents * split_user1_percent / 100.0)
        ELSE
          -ROUND(amount_cents * split_user1_percent / 100.0)
        END
      END
    ), 0) AS balance_cents FROM transactions
  `);

  // Calculate balance from payments
  // When user2 pays user1, that reduces what user2 owes (subtract)
  // When user1 pays user2, that reduces what user1 owes (add)
  const payResult = await pool.query(`
    SELECT COALESCE(SUM(
      CASE
        WHEN paid_by = 'user2' THEN -amount_cents
        ELSE amount_cents
      END
    ), 0) AS payment_balance_cents FROM payments
  `);

  const txBalance = parseInt(txResult.rows[0].balance_cents);
  const paymentBalance = parseInt(payResult.rows[0].payment_balance_cents);
  const netBalanceCents = txBalance + paymentBalance;

  res.json({
    balanceCents: netBalanceCents,
    balance: netBalanceCents / 100,
  });
});

export default router;
