import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM payments ORDER BY date DESC, created_at DESC'
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { amount, date, paidBy, paidTo } = req.body;
  const amountCents = Math.round(amount * 100);

  const result = await pool.query(
    `INSERT INTO payments (amount_cents, paid_by, paid_to, date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [amountCents, paidBy, paidTo, date]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { amount, date, paidBy, paidTo } = req.body;
  const amountCents = Math.round(amount * 100);

  const result = await pool.query(
    `UPDATE payments
     SET amount_cents = $1, date = $2, paid_by = $3, paid_to = $4
     WHERE id = $5
     RETURNING *`,
    [amountCents, date, paidBy, paidTo, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
