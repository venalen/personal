import { useState, useEffect } from 'react';
import { User, RecurringRule } from '../types';
import { createRecurring, updateRecurring } from '../api';

interface Props {
  currentUser: User;
  onSaved: () => void;
  onCancel: () => void;
  user1Name: string;
  user2Name: string;
  editingRule?: RecurringRule | null;
}

export default function RecurringForm({ currentUser, onSaved, onCancel, user1Name, user2Name, editingRule }: Props) {
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<User>(currentUser);
  const [splitUser1Percent, setSplitUser1Percent] = useState(50);
  const [splitMode, setSplitMode] = useState<'percentage' | 'offset'>('percentage');
  const [splitOffsetUser1, setSplitOffsetUser1] = useState('');
  const [splitOffsetUser2, setSplitOffsetUser2] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingRule) {
      setDescription(editingRule.description);
      setNotes(editingRule.notes || '');
      setAmount((editingRule.amount_cents / 100).toFixed(2));
      setPaidBy(editingRule.paid_by);
      setSplitUser1Percent(editingRule.split_user1_percent);
      setSplitMode(editingRule.split_mode);
      if (editingRule.split_mode === 'offset') {
        const u1 = editingRule.split_offset_user1_cents;
        const u2 = editingRule.split_offset_user2_cents;
        setSplitOffsetUser1(u1 > 0 ? (u1 / 100).toFixed(2) : '');
        setSplitOffsetUser2(u2 > 0 ? (u2 / 100).toFixed(2) : '');
      }
      setDayOfMonth(String(editingRule.day_of_month));
      setStartDate(editingRule.start_date.slice(0, 10));
      setEndDate(editingRule.end_date ? editingRule.end_date.slice(0, 10) : '');
    }
  }, [editingRule]);

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

  const parsedDay = parseInt(dayOfMonth);
  const dayValid = !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!description || isNaN(parsed) || parsed <= 0) return;
    if (offsetError || !dayValid) return;

    setSubmitting(true);
    const data = {
      description,
      notes,
      amount: parsed,
      paidBy,
      splitUser1Percent: splitMode === 'percentage' ? splitUser1Percent : undefined,
      splitMode,
      splitOffsetUser1Cents: splitMode === 'offset' ? user1OffsetCents - user2OffsetCents : undefined,
      splitOffsetUser2Cents: splitMode === 'offset' ? user2OffsetCents - user1OffsetCents : undefined,
      dayOfMonth: parsedDay,
      startDate,
      endDate: endDate || undefined,
    };

    if (editingRule) {
      await updateRecurring(editingRule.id, data);
    } else {
      await createRecurring(data);
    }
    setSubmitting(false);
    onSaved();
  }

  return (
    <form className="recurring-form" onSubmit={handleSubmit}>
      <h3>{editingRule ? 'Edit Recurring' : 'Add Recurring'}</h3>
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
      <div className="recurring-schedule">
        <label>Day of month:</label>
        <input
          type="number"
          min={1}
          max={31}
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
        />
        {parsedDay > 28 && (
          <span className="recurring-hint">Will use last day of shorter months</span>
        )}
      </div>
      <div className="recurring-dates">
        <div>
          <label>Start date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label>End date (optional):</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      {editingRule && (
        <div className="recurring-next">
          Next occurrence: {new Date(editingRule.next_occurrence).toLocaleDateString()}
        </div>
      )}
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
      <div className="recurring-form-actions">
        <button type="submit" disabled={submitting || !!offsetError || !dayValid}>
          {submitting ? 'Saving...' : editingRule ? 'Update' : 'Add Recurring'}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
