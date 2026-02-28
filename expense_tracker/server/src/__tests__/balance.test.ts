import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Balance API', () => {
  it('empty state returns balanceCents 0', async () => {
    const res = await request(app).get('/api/balance');
    expect(res.status).toBe(200);
    expect(res.body.balanceCents).toBe(0);
  });

  it('User1 pays $100 at 50/50 → balance 5000', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        description: 'Dinner',
        amount: 100,
        date: '2024-01-01',
        paidBy: 'user1',
        splitUser1Percent: 50,
        splitMode: 'percentage',
      });

    const res = await request(app).get('/api/balance');
    expect(res.body.balanceCents).toBe(5000);
  });

  it('User2 pays $100 at 50/50 → balance -5000', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        description: 'Dinner',
        amount: 100,
        date: '2024-01-01',
        paidBy: 'user2',
        splitUser1Percent: 50,
        splitMode: 'percentage',
      });

    const res = await request(app).get('/api/balance');
    expect(res.body.balanceCents).toBe(-5000);
  });

  it('custom split 70/30 → balance 3000', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        description: 'Custom split',
        amount: 100,
        date: '2024-01-01',
        paidBy: 'user1',
        splitUser1Percent: 70,
        splitMode: 'percentage',
      });

    // User1 paid 100, their share is 70 → User2 owes them 30 → balance = 3000
    const res = await request(app).get('/api/balance');
    expect(res.body.balanceCents).toBe(3000);
  });

  it('offset mode: User1 pays $100, User1 offset +$10 → balance 4000', async () => {
    await request(app)
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

    // User1 share = 5000 + 1000 = 6000, they paid 10000, balance = 10000 - 6000 = 4000
    const res = await request(app).get('/api/balance');
    expect(res.body.balanceCents).toBe(4000);
  });

  it('payment reduces balance to 0', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        description: 'Dinner',
        amount: 100,
        date: '2024-01-01',
        paidBy: 'user1',
        splitUser1Percent: 50,
        splitMode: 'percentage',
      });

    // Balance is 5000, User2 pays User1 $50
    await request(app)
      .post('/api/payments')
      .send({ amount: 50, date: '2024-01-02', paidBy: 'user2', paidTo: 'user1' });

    const res = await request(app).get('/api/balance');
    expect(res.body.balanceCents).toBe(0);
  });
});
