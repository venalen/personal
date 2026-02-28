import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Transactions API', () => {
  it('POST creates a transaction and returns 201', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        description: 'Groceries',
        amount: 50.00,
        date: '2024-01-15',
        paidBy: 'user1',
        splitUser1Percent: 50,
        splitMode: 'percentage',
      });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Groceries');
    expect(res.body.amount_cents).toBe(5000);
    expect(res.body.paid_by).toBe('user1');
  });

  it('GET returns all transactions', async () => {
    await request(app)
      .post('/api/transactions')
      .send({ description: 'A', amount: 10, date: '2024-01-01', paidBy: 'user1' });
    await request(app)
      .post('/api/transactions')
      .send({ description: 'B', amount: 20, date: '2024-01-02', paidBy: 'user2' });

    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PUT updates a transaction', async () => {
    const created = await request(app)
      .post('/api/transactions')
      .send({ description: 'Old', amount: 10, date: '2024-01-01', paidBy: 'user1' });

    const res = await request(app)
      .put(`/api/transactions/${created.body.id}`)
      .send({ description: 'Updated', amount: 20, date: '2024-01-02', paidBy: 'user2' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated');
    expect(res.body.amount_cents).toBe(2000);
  });

  it('PUT returns 404 for missing id', async () => {
    const res = await request(app)
      .put('/api/transactions/99999')
      .send({ description: 'X', amount: 10, date: '2024-01-01', paidBy: 'user1' });
    expect(res.status).toBe(404);
  });

  it('DELETE returns 204', async () => {
    const created = await request(app)
      .post('/api/transactions')
      .send({ description: 'ToDelete', amount: 10, date: '2024-01-01', paidBy: 'user1' });

    const res = await request(app).delete(`/api/transactions/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await request(app).get('/api/transactions');
    expect(list.body).toHaveLength(0);
  });

  describe('Penny distribution', () => {
    it('assigns split_extra_to for odd-cent 50/50 splits', async () => {
      const res1 = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Odd1',
          amount: 10.01,
          date: '2024-01-01',
          paidBy: 'user1',
          splitUser1Percent: 50,
          splitMode: 'percentage',
        });
      expect(res1.body.split_extra_to).toBe('user1');

      const res2 = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Odd2',
          amount: 10.03,
          date: '2024-01-02',
          paidBy: 'user2',
          splitUser1Percent: 50,
          splitMode: 'percentage',
        });
      expect(res2.body.split_extra_to).toBe('user2');
    });
  });

  describe('Offset mode', () => {
    it('POST with offsets computes correct split_user1_percent', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Offset test',
          amount: 100,
          date: '2024-01-01',
          paidBy: 'user1',
          splitMode: 'offset',
          splitOffsetUser1Cents: 1000,
          splitOffsetUser2Cents: -1000,
        });
      expect(res.status).toBe(201);
      // half=5000, User1 share = 5000+1000=6000 out of 10000 = 60%
      expect(res.body.split_user1_percent).toBe(60);
      expect(res.body.split_offset_user1_cents).toBe(1000);
    });

    it('rejects offsets that exceed total', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Bad offsets',
          amount: 20,
          date: '2024-01-01',
          paidBy: 'user1',
          splitMode: 'offset',
          splitOffsetUser1Cents: 80000,
          splitOffsetUser2Cents: 80000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid offset/);
    });

    it('rejects negative shares', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Negative share',
          amount: 20,
          date: '2024-01-01',
          paidBy: 'user1',
          splitMode: 'offset',
          splitOffsetUser1Cents: -150000,
          splitOffsetUser2Cents: 0,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid offset/);
    });

    it('accepts valid offsets with correct shares', async () => {
      // $20 = 2000 cents, half = 1000
      // User1 +$3 = 1300, User2 -$3 = 700, sum = 2000
      const res = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Valid offsets',
          amount: 20,
          date: '2024-01-01',
          paidBy: 'user1',
          splitMode: 'offset',
          splitOffsetUser1Cents: 300,
          splitOffsetUser2Cents: -300,
        });
      expect(res.status).toBe(201);
      // User1 share = 1300/2000 = 65%
      expect(res.body.split_user1_percent).toBe(65);
    });

    it('zero offsets behave like 50/50', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Zero offsets',
          amount: 20,
          date: '2024-01-01',
          paidBy: 'user1',
          splitMode: 'offset',
          splitOffsetUser1Cents: 0,
          splitOffsetUser2Cents: 0,
        });
      expect(res.status).toBe(201);
      expect(res.body.split_user1_percent).toBe(50);
    });
  });
});
