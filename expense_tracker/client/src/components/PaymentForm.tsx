import { useState } from 'react';
import { User } from '../types';
import { createPayment } from '../api';

interface Props {
  currentUser: User;
  onCreated: () => void;
  user1Name: string;
  user2Name: string;
}

export default function PaymentForm({ currentUser, onCreated, user1Name, user2Name }: Props) {
  const otherUser: User = currentUser === 'user1' ? 'user2' : 'user1';
  const otherName = currentUser === 'user1' ? user2Name : user1Name;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    setSubmitting(true);
    await createPayment({
      amount: parsed,
      date,
      paidBy: currentUser,
      paidTo: otherUser,
    });
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setSubmitting(false);
    onCreated();
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h3>Record Payment to {otherName}</h3>
      <input
        type="number"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0.01"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Recording...' : 'Record Payment'}
      </button>
    </form>
  );
}
