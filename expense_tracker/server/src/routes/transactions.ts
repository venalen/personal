import { Router, Request, Response } from 'express';
import pool from '../db';
import { validateOffsets, computeFinalPercent, computeSplitExtraToIfNeeded } from '../splits';
import { generateDueRecurring } from '../recurring';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  await generateDueRecurring(pool);
  const result = await pool.query(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { description, notes, amount, date, paidBy, splitUser1Percent = 50, splitMode = 'percentage', splitOffsetUser1Cents = 0, splitOffsetUser2Cents = 0 } = req.body;
  const amountCents = Math.round(amount * 100);

  if (splitMode === 'offset') {
    const error = validateOffsets(amountCents, splitOffsetUser1Cents, splitOffsetUser2Cents);
    if (error) {
      res.status(400).json({ error });
      return;
    }
  }

  const finalPercent = computeFinalPercent(amountCents, splitMode, splitUser1Percent, splitOffsetUser1Cents);
  const splitExtraTo = await computeSplitExtraToIfNeeded(pool, amountCents, splitMode, finalPercent);

  const result = await pool.query(
    `INSERT INTO transactions (description, notes, amount_cents, paid_by, split_extra_to, split_user1_percent, split_mode, split_offset_user1_cents, split_offset_user2_cents, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [description, notes || null, amountCents, paidBy, splitExtraTo, finalPercent, splitMode, splitOffsetUser1Cents, splitOffsetUser2Cents, date]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { description, notes, amount, date, paidBy, splitUser1Percent = 50, splitMode = 'percentage', splitOffsetUser1Cents = 0, splitOffsetUser2Cents = 0 } = req.body;
  const amountCents = Math.round(amount * 100);

  if (splitMode === 'offset') {
    const error = validateOffsets(amountCents, splitOffsetUser1Cents, splitOffsetUser2Cents);
    if (error) {
      res.status(400).json({ error });
      return;
    }
  }

  const finalPercent = computeFinalPercent(amountCents, splitMode, splitUser1Percent, splitOffsetUser1Cents);
  const splitExtraTo = await computeSplitExtraToIfNeeded(pool, amountCents, splitMode, finalPercent, parseInt(req.params.id));

  const result = await pool.query(
    `UPDATE transactions
     SET description = $1, notes = $2, amount_cents = $3, paid_by = $4, split_extra_to = $5, split_user1_percent = $6, split_mode = $7, split_offset_user1_cents = $8, split_offset_user2_cents = $9, date = $10
     WHERE id = $11
     RETURNING *`,
    [description, notes || null, amountCents, paidBy, splitExtraTo, finalPercent, splitMode, splitOffsetUser1Cents, splitOffsetUser2Cents, date, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
