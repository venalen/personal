import { beforeAll, beforeEach, afterAll } from 'vitest';
import { migrate } from '../migrate';
import pool from '../db';

beforeAll(async () => {
  await migrate();
});

beforeEach(async () => {
  await pool.query('TRUNCATE recurring_rules, transactions, payments RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
