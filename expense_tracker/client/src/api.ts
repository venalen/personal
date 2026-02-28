import { Transaction, Payment, Balance } from './types';

const BASE = '/api';

export async function fetchConfig(): Promise<{ user1Name: string; user2Name: string }> {
  const res = await fetch(`${BASE}/config`);
  return res.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/transactions`);
  return res.json();
}

export async function createTransaction(data: {
  description: string;
  notes: string;
  amount: number;
  date: string;
  paidBy: string;
  splitUser1Percent?: number;
  splitMode?: 'percentage' | 'offset';
  splitOffsetUser1Cents?: number;
  splitOffsetUser2Cents?: number;
}): Promise<Transaction> {
  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTransaction(id: number, data: {
  description: string;
  notes: string;
  amount: number;
  date: string;
  paidBy: string;
  splitUser1Percent?: number;
  splitMode?: 'percentage' | 'offset';
  splitOffsetUser1Cents?: number;
  splitOffsetUser2Cents?: number;
}): Promise<Transaction> {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE' });
}

export async function fetchPayments(): Promise<Payment[]> {
  const res = await fetch(`${BASE}/payments`);
  return res.json();
}

export async function createPayment(data: {
  amount: number;
  date: string;
  paidBy: string;
  paidTo: string;
}): Promise<Payment> {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePayment(id: number, data: {
  amount: number;
  date: string;
}): Promise<Payment> {
  const res = await fetch(`${BASE}/payments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePayment(id: number): Promise<void> {
  await fetch(`${BASE}/payments/${id}`, { method: 'DELETE' });
}

export async function fetchBalance(): Promise<Balance> {
  const res = await fetch(`${BASE}/balance`);
  return res.json();
}
