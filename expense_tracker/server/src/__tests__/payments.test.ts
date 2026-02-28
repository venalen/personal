import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Payments API', () => {
  it('POST creates a payment and returns 201', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({
        amount: 25.50,
        date: '2024-01-15',
        paidBy: 'user2',
        paidTo: 'user1',
      });
    expect(res.status).toBe(201);
    expect(res.body.amount_cents).toBe(2550);
    expect(res.body.paid_by).toBe('user2');
    expect(res.body.paid_to).toBe('user1');
  });

  it('GET returns all payments', async () => {
    await request(app)
      .post('/api/payments')
      .send({ amount: 10, date: '2024-01-01', paidBy: 'user1', paidTo: 'user2' });
    await request(app)
      .post('/api/payments')
      .send({ amount: 20, date: '2024-01-02', paidBy: 'user2', paidTo: 'user1' });

    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PUT updates a payment', async () => {
    const created = await request(app)
      .post('/api/payments')
      .send({ amount: 10, date: '2024-01-01', paidBy: 'user1', paidTo: 'user2' });

    const res = await request(app)
      .put(`/api/payments/${created.body.id}`)
      .send({ amount: 30, date: '2024-01-05', paidBy: 'user2', paidTo: 'user1' });
    expect(res.status).toBe(200);
    expect(res.body.amount_cents).toBe(3000);
  });

  it('PUT returns 404 for missing id', async () => {
    const res = await request(app)
      .put('/api/payments/99999')
      .send({ amount: 10, date: '2024-01-01', paidBy: 'user1', paidTo: 'user2' });
    expect(res.status).toBe(404);
  });

  it('DELETE returns 204', async () => {
    const created = await request(app)
      .post('/api/payments')
      .send({ amount: 10, date: '2024-01-01', paidBy: 'user1', paidTo: 'user2' });

    const res = await request(app).delete(`/api/payments/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await request(app).get('/api/payments');
    expect(list.body).toHaveLength(0);
  });
});
