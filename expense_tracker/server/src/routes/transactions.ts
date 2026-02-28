import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { description, notes, amount, date, paidBy, splitUser1Percent = 50, splitMode = 'percentage', splitOffsetUser1Cents = 0, splitOffsetUser2Cents = 0 } = req.body;
  const amountCents = Math.round(amount * 100);

  // Server-side offset validation: offsets must be zero-sum and shares non-negative
  if (splitMode === 'offset') {
    if (splitOffsetUser1Cents + splitOffsetUser2Cents !== 0) {
      res.status(400).json({ error: 'Invalid offset: offsets must sum to zero' });
      return;
    }
    const half = Math.round(amountCents / 2);
    const u1Share = half + splitOffsetUser1Cents;
    const u2Share = half + splitOffsetUser2Cents;
    if (u1Share < 0 || u2Share < 0) {
      res.status(400).json({ error: 'Invalid offset: shares exceed total or are negative' });
      return;
    }
  }

  // When mode is offset, compute display percentage from offset
  let finalPercent = splitUser1Percent;
  if (splitMode === 'offset') {
    const user1Share = Math.round(amountCents / 2) + splitOffsetUser1Cents;
    finalPercent = Math.round((user1Share / amountCents) * 100);
  }

  let splitExtraTo: string | null = null;
  if (splitMode === 'percentage' && finalPercent === 50 && amountCents % 2 !== 0) {
    const countResult = await pool.query(
      "SELECT split_extra_to, COUNT(*) as cnt FROM transactions WHERE split_extra_to IS NOT NULL GROUP BY split_extra_to"
    );
    const counts: Record<string, number> = { user1: 0, user2: 0 };
    for (const row of countResult.rows) {
      counts[row.split_extra_to] = parseInt(row.cnt);
    }
    splitExtraTo = counts.user1 <= counts.user2 ? 'user1' : 'user2';
  }

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

  // Server-side offset validation: offsets must be zero-sum and shares non-negative
  if (splitMode === 'offset') {
    if (splitOffsetUser1Cents + splitOffsetUser2Cents !== 0) {
      res.status(400).json({ error: 'Invalid offset: offsets must sum to zero' });
      return;
    }
    const half = Math.round(amountCents / 2);
    const u1Share = half + splitOffsetUser1Cents;
    const u2Share = half + splitOffsetUser2Cents;
    if (u1Share < 0 || u2Share < 0) {
      res.status(400).json({ error: 'Invalid offset: shares exceed total or are negative' });
      return;
    }
  }

  let finalPercent = splitUser1Percent;
  if (splitMode === 'offset') {
    const user1Share = Math.round(amountCents / 2) + splitOffsetUser1Cents;
    finalPercent = Math.round((user1Share / amountCents) * 100);
  }

  let splitExtraTo: string | null = null;
  if (splitMode === 'percentage' && finalPercent === 50 && amountCents % 2 !== 0) {
    const countResult = await pool.query(
      "SELECT split_extra_to, COUNT(*) as cnt FROM transactions WHERE split_extra_to IS NOT NULL AND id != $1 GROUP BY split_extra_to",
      [req.params.id]
    );
    const counts: Record<string, number> = { user1: 0, user2: 0 };
    for (const row of countResult.rows) {
      counts[row.split_extra_to] = parseInt(row.cnt);
    }
    splitExtraTo = counts.user1 <= counts.user2 ? 'user1' : 'user2';
  }

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
