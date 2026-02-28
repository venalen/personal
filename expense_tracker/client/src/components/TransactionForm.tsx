import { useState, useEffect } from 'react';
import { User } from '../types';
import { createTransaction } from '../api';

interface Props {
  currentUser: User;
  onCreated: () => void;
  user1Name: string;
  user2Name: string;
}

export default function TransactionForm({ currentUser, onCreated, user1Name, user2Name }: Props) {
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState<User>(currentUser);
  const [splitUser1Percent, setSplitUser1Percent] = useState(50);
  const [splitMode, setSplitMode] = useState<'percentage' | 'offset'>('percentage');
  const [splitOffsetUser1, setSplitOffsetUser1] = useState('');
  const [splitOffsetUser2, setSplitOffsetUser2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPaidBy(currentUser);
  }, [currentUser]);

  const amountCents = Math.round((parseFloat(amount) || 0) * 100);
  const user1OffsetCents = Math.round((parseFloat(splitOffsetUser1) || 0) * 100);
  const user2OffsetCents = Math.round((parseFloat(splitOffsetUser2) || 0) * 100);
  const halfCents = Math.round(amountCents / 2);

  const user1ShareCents = halfCents + user1OffsetCents - user2OffsetCents;
  const user2ShareCents = halfCents + user2OffsetCents - user1OffsetCents;

  let offsetError = '';
  if (splitMode === 'offset' && amountCents > 0) {
    if (user1ShareCents < 0 || user2ShareCents < 0) {
      offsetError = 'Offsets exceed the total amount';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!description || isNaN(parsed) || parsed <= 0) return;
    if (offsetError) return;

    setSubmitting(true);
    await createTransaction({
      description,
      notes,
      amount: parsed,
      date,
      paidBy,
      splitUser1Percent: splitMode === 'percentage' ? splitUser1Percent : undefined,
      splitMode,
      splitOffsetUser1Cents: splitMode === 'offset' ? user1OffsetCents - user2OffsetCents : undefined,
      splitOffsetUser2Cents: splitMode === 'offset' ? user2OffsetCents - user1OffsetCents : undefined,
    });
    setDescription('');
    setNotes('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setPaidBy(currentUser);
    setSplitUser1Percent(50);
    setSplitMode('percentage');
    setSplitOffsetUser1('');
    setSplitOffsetUser2('');
    setSubmitting(false);
    onCreated();
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <div className="paid-by-toggle">
        <label>Paid by:</label>
        <div className="split-mode-toggle">
          <button type="button" className={paidBy === 'user1' ? 'active' : ''} onClick={() => setPaidBy('user1')}>{user1Name}</button>
          <button type="button" className={paidBy === 'user2' ? 'active' : ''} onClick={() => setPaidBy('user2')}>{user2Name}</button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="amount-input-wrapper">
        <span className="amount-prefix">$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
          }}
          required
        />
      </div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <div className="split-mode-toggle">
        <button type="button" className={splitMode === 'percentage' ? 'active' : ''} onClick={() => setSplitMode('percentage')}>
          Percentage
        </button>
        <button type="button" className={splitMode === 'offset' ? 'active' : ''} onClick={() => setSplitMode('offset')}>
          + Offset
        </button>
      </div>
      <div className="split-area">
        <div className="split-select" style={splitMode !== 'percentage' ? { visibility: 'hidden' } : undefined}>
          <label>Split:</label>
          <div className="split-inputs">
            <label>{user1Name}:</label>
            <div className="percent-input-wrapper">
              <input
                type="number"
                value={splitUser1Percent}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  setSplitUser1Percent(v);
                }}
                min="0"
                max="100"
              />
              <span className="percent-suffix">%</span>
            </div>
            <label>{user2Name}:</label>
            <span>{100 - splitUser1Percent}%</span>
          </div>
        </div>
        <div className="split-select" style={splitMode !== 'offset' ? { visibility: 'hidden' } : undefined}>
          <div className="split-offset-inputs">
            <div className="split-offset-input">
              <label>{user1Name}: +$</label>
              <input
                type="number"
                value={splitOffsetUser1}
                onChange={(e) => setSplitOffsetUser1(e.target.value)}
                step="0.01"
                disabled={!amountCents}
                placeholder="0.00"
              />
            </div>
            <div className="split-offset-input">
              <label>{user2Name}: +$</label>
              <input
                type="number"
                value={splitOffsetUser2}
                onChange={(e) => setSplitOffsetUser2(e.target.value)}
                step="0.01"
                disabled={!amountCents}
                placeholder="0.00"
              />
            </div>
          </div>
          {amountCents > 0 && !offsetError && (
            <div className="split-preview">
              {user1Name}: ${(user1ShareCents / 100).toFixed(2)} / {user2Name}: ${(user2ShareCents / 100).toFixed(2)}
            </div>
          )}
          {offsetError && <div className="split-error">{offsetError}</div>}
        </div>
      </div>
      <button type="submit" disabled={submitting || !!offsetError}>
        {submitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}
