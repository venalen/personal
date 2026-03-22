import { Router, Request, Response } from 'express';
import pool from '../db';
import { validateOffsets } from '../splits';
import { computeNextOccurrence } from '../recurring';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT * FROM recurring_rules
     ORDER BY active DESC, created_at DESC`
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const {
    description,
    notes,
    amount,
    paidBy,
    splitUser1Percent = 50,
    splitMode = 'percentage',
    splitOffsetUser1Cents = 0,
    splitOffsetUser2Cents = 0,
    dayOfMonth,
    startDate,
    endDate,
  } = req.body;

  if (!description || !description.trim()) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }

  const amountCents = Math.round((parseFloat(amount) || 0) * 100);
  if (amountCents <= 0) {
    res.status(400).json({ error: 'Amount must be greater than 0' });
    return;
  }

  if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) {
    res.status(400).json({ error: 'Day of month must be between 1 and 31' });
    return;
  }

  if (!startDate) {
    res.status(400).json({ error: 'Start date is required' });
    return;
  }

  if (endDate && endDate < startDate) {
    res.status(400).json({ error: 'End date must be on or after start date' });
    return;
  }

  if (splitMode === 'offset') {
    const error = validateOffsets(amountCents, splitOffsetUser1Cents, splitOffsetUser2Cents);
    if (error) {
      res.status(400).json({ error });
      return;
    }
  }

  const nextOccurrence = computeNextOccurrence(dayOfMonth, new Date(startDate + 'T00:00:00'));

  const result = await pool.query(
    `INSERT INTO recurring_rules
     (description, notes, amount_cents, paid_by, split_user1_percent, split_mode,
      split_offset_user1_cents, split_offset_user2_cents, day_of_month, start_date, end_date, next_occurrence)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      description,
      notes || null,
      amountCents,
      paidBy,
      splitUser1Percent,
      splitMode,
      splitOffsetUser1Cents,
      splitOffsetUser2Cents,
      dayOfMonth,
      startDate,
      endDate || null,
      nextOccurrence.toISOString().slice(0, 10),
    ]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const {
    description,
    notes,
    amount,
    paidBy,
    splitUser1Percent = 50,
    splitMode = 'percentage',
    splitOffsetUser1Cents = 0,
    splitOffsetUser2Cents = 0,
    dayOfMonth,
    startDate,
    endDate,
  } = req.body;

  if (!description || !description.trim()) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }

  const amountCents = Math.round((parseFloat(amount) || 0) * 100);
  if (amountCents <= 0) {
    res.status(400).json({ error: 'Amount must be greater than 0' });
    return;
  }

  if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) {
    res.status(400).json({ error: 'Day of month must be between 1 and 31' });
    return;
  }

  if (splitMode === 'offset') {
    const error = validateOffsets(amountCents, splitOffsetUser1Cents, splitOffsetUser2Cents);
    if (error) {
      res.status(400).json({ error });
      return;
    }
  }

  // Get the current rule to check if day_of_month changed
  const current = await pool.query('SELECT day_of_month FROM recurring_rules WHERE id = $1', [req.params.id]);
  if (current.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  // Recalculate next_occurrence if day_of_month changed
  let nextOccurrenceUpdate = '';
  const params: (string | number | null)[] = [
    description,
    notes || null,
    amountCents,
    paidBy,
    splitUser1Percent,
    splitMode,
    splitOffsetUser1Cents,
    splitOffsetUser2Cents,
    dayOfMonth,
    startDate,
    endDate || null,
  ];

  if (current.rows[0].day_of_month !== dayOfMonth) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextOccurrence = computeNextOccurrence(dayOfMonth, today);
    nextOccurrenceUpdate = `, next_occurrence = $12`;
    params.push(nextOccurrence.toISOString().slice(0, 10));
    params.push(req.params.id);
  } else {
    params.push(req.params.id);
  }

  const paramIdx = params.length;
  const result = await pool.query(
    `UPDATE recurring_rules
     SET description = $1, notes = $2, amount_cents = $3, paid_by = $4,
         split_user1_percent = $5, split_mode = $6,
         split_offset_user1_cents = $7, split_offset_user2_cents = $8,
         day_of_month = $9, start_date = $10, end_date = $11${nextOccurrenceUpdate}
     WHERE id = $${paramIdx}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await pool.query('DELETE FROM recurring_rules WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

router.put('/:id/deactivate', async (req: Request, res: Response) => {
  const result = await pool.query(
    `UPDATE recurring_rules SET active = false WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(result.rows[0]);
});

router.put('/:id/activate', async (req: Request, res: Response) => {
  // Recalculate next_occurrence from today
  const current = await pool.query('SELECT day_of_month FROM recurring_rules WHERE id = $1', [req.params.id]);
  if (current.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextOccurrence = computeNextOccurrence(current.rows[0].day_of_month, today);

  const result = await pool.query(
    `UPDATE recurring_rules SET active = true, next_occurrence = $1 WHERE id = $2 RETURNING *`,
    [nextOccurrence.toISOString().slice(0, 10), req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(result.rows[0]);
});

export default router;
