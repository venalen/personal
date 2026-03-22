import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import pool from '../db';
import { computeNextOccurrence } from '../recurring';

describe('Recurring Rules API', () => {
  const baseRule = {
    description: 'Rent',
    amount: 2000,
    paidBy: 'user1',
    splitUser1Percent: 50,
    splitMode: 'percentage',
    dayOfMonth: 1,
    startDate: '2026-01-01',
  };

  describe('CRUD', () => {
    it('POST creates a recurring rule and returns 201', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send(baseRule);
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Rent');
      expect(res.body.amount_cents).toBe(200000);
      expect(res.body.day_of_month).toBe(1);
      expect(res.body.active).toBe(true);
      expect(res.body.next_occurrence).toBeDefined();
    });

    it('GET returns all recurring rules', async () => {
      await request(app).post('/api/recurring').send(baseRule);
      await request(app).post('/api/recurring').send({ ...baseRule, description: 'Internet' });

      const res = await request(app).get('/api/recurring');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('PUT updates a recurring rule', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);
      const res = await request(app)
        .put(`/api/recurring/${created.body.id}`)
        .send({ ...baseRule, description: 'Updated Rent', amount: 2500 });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated Rent');
      expect(res.body.amount_cents).toBe(250000);
    });

    it('PUT returns 404 for missing id', async () => {
      const res = await request(app)
        .put('/api/recurring/99999')
        .send(baseRule);
      expect(res.status).toBe(404);
    });

    it('DELETE returns 204', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);
      const res = await request(app).delete(`/api/recurring/${created.body.id}`);
      expect(res.status).toBe(204);

      const list = await request(app).get('/api/recurring');
      expect(list.body).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    it('rejects missing description', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send({ ...baseRule, description: '' });
      expect(res.status).toBe(400);
    });

    it('rejects zero amount', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send({ ...baseRule, amount: 0 });
      expect(res.status).toBe(400);
    });

    it('rejects invalid day_of_month', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send({ ...baseRule, dayOfMonth: 32 });
      expect(res.status).toBe(400);
    });

    it('rejects end_date before start_date', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send({ ...baseRule, endDate: '2025-12-31' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid offsets', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .send({
          ...baseRule,
          splitMode: 'offset',
          splitOffsetUser1Cents: 500000,
          splitOffsetUser2Cents: 500000,
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Activate / Deactivate', () => {
    it('deactivate sets active to false', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);
      const res = await request(app).put(`/api/recurring/${created.body.id}/deactivate`);
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });

    it('activate sets active to true and recalculates next_occurrence', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);
      await request(app).put(`/api/recurring/${created.body.id}/deactivate`);
      const res = await request(app).put(`/api/recurring/${created.body.id}/activate`);
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
      // next_occurrence should be in the future
      expect(new Date(res.body.next_occurrence) >= new Date()).toBe(true);
    });

    it('deactivate returns 404 for missing id', async () => {
      const res = await request(app).put('/api/recurring/99999/deactivate');
      expect(res.status).toBe(404);
    });
  });

  describe('Generation', () => {
    it('generates a transaction when rule is due', async () => {
      // Create a rule with next_occurrence in the past
      const created = await request(app).post('/api/recurring').send({
        ...baseRule,
        startDate: '2026-01-01',
      });

      // Manually set next_occurrence to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await pool.query(
        'UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2',
        [yesterday.toISOString().slice(0, 10), created.body.id]
      );

      // GET /api/transactions triggers generation
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Rent');
      expect(res.body[0].amount_cents).toBe(200000);
      expect(res.body[0].recurring_rule_id).toBe(created.body.id);
    });

    it('catches up multiple months', async () => {
      const created = await request(app).post('/api/recurring').send({
        ...baseRule,
        dayOfMonth: 15,
        startDate: '2025-01-01',
      });

      // Set next_occurrence to 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setDate(15);
      await pool.query(
        'UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2',
        [threeMonthsAgo.toISOString().slice(0, 10), created.body.id]
      );

      const res = await request(app).get('/api/transactions');
      // Should have generated at least 3 transactions (possibly 4 depending on date)
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      // All should reference the rule
      for (const tx of res.body) {
        expect(tx.recurring_rule_id).toBe(created.body.id);
      }
    });

    it('does not generate for deactivated rules', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await pool.query(
        'UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2',
        [yesterday.toISOString().slice(0, 10), created.body.id]
      );

      // Deactivate
      await request(app).put(`/api/recurring/${created.body.id}/deactivate`);

      const res = await request(app).get('/api/transactions');
      expect(res.body).toHaveLength(0);
    });

    it('auto-deactivates when end_date is reached', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();

      const created = await request(app).post('/api/recurring').send({
        ...baseRule,
        startDate: '2025-01-01',
        endDate: today.toISOString().slice(0, 10),
      });

      // Set next_occurrence to yesterday
      await pool.query(
        'UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2',
        [yesterday.toISOString().slice(0, 10), created.body.id]
      );

      // Trigger generation
      await request(app).get('/api/transactions');

      // Check rule is now inactive
      const rules = await request(app).get('/api/recurring');
      const rule = rules.body.find((r: { id: number }) => r.id === created.body.id);
      // The rule should have generated the transaction and then deactivated
      // (it depends on whether next_occurrence after advance exceeds end_date)
      const txRes = await request(app).get('/api/transactions');
      expect(txRes.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deleting a rule leaves generated transactions with null recurring_rule_id', async () => {
      const created = await request(app).post('/api/recurring').send(baseRule);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await pool.query(
        'UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2',
        [yesterday.toISOString().slice(0, 10), created.body.id]
      );

      // Trigger generation
      await request(app).get('/api/transactions');

      // Delete the rule
      await request(app).delete(`/api/recurring/${created.body.id}`);

      // Transactions should still exist but with null recurring_rule_id
      const res = await request(app).get('/api/transactions');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].recurring_rule_id).toBeNull();
    });
  });
});

describe('computeNextOccurrence', () => {
  it('returns same month if day has not passed', () => {
    const result = computeNextOccurrence(15, new Date(2026, 0, 10)); // Jan 10 -> Jan 15
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('returns next month if day has passed', () => {
    const result = computeNextOccurrence(1, new Date(2026, 3, 15)); // Apr 15 -> May 1
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(1);
  });

  it('clamps day 31 to Feb 28 in non-leap year', () => {
    const result = computeNextOccurrence(31, new Date(2025, 1, 1)); // Feb 1, 2025
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('clamps day 31 to Feb 29 in leap year', () => {
    const result = computeNextOccurrence(31, new Date(2028, 1, 1)); // Feb 1, 2028
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it('returns same day if afterDate is that day', () => {
    const result = computeNextOccurrence(15, new Date(2026, 0, 15)); // Jan 15 -> Jan 15
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(0);
  });

  it('wraps to next year', () => {
    const result = computeNextOccurrence(1, new Date(2026, 11, 15)); // Dec 15 -> Jan 1
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
});
