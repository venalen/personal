import { useState } from 'react';
import { Transaction, Payment, User } from '../types';
import { deleteTransaction, deletePayment, updateTransaction, updatePayment } from '../api';

interface Props {
  currentUser: User;
  transactions: Transaction[];
  payments: Payment[];
  onChanged: () => void;
  user1Name: string;
  user2Name: string;
}

function displayName(user: string, user1Name: string, user2Name: string): string {
  return user === 'user1' ? user1Name : user2Name;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const parts = dateStr.slice(0, 10).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type ListItem =
  | { type: 'transaction'; data: Transaction; sortDate: string; sortCreated: string }
  | { type: 'payment'; data: Payment; sortDate: string; sortCreated: string };

export default function TransactionList({
  currentUser,
  transactions,
  payments,
  onChanged,
  user1Name,
  user2Name,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const u1Short = user1Name.charAt(0);
  const u2Short = user2Name.charAt(0);

  const items: ListItem[] = [
    ...transactions.map((t) => ({
      type: 'transaction' as const,
      data: t,
      sortDate: t.date,
      sortCreated: t.created_at,
    })),
    ...payments.map((p) => ({
      type: 'payment' as const,
      data: p,
      sortDate: p.date,
      sortCreated: p.created_at,
    })),
  ].sort((a, b) => {
    const dateCmp = b.sortDate.localeCompare(a.sortDate);
    if (dateCmp !== 0) return dateCmp;
    return b.sortCreated.localeCompare(a.sortCreated);
  });

  async function handleDeleteTransaction(id: number) {
    await deleteTransaction(id);
    onChanged();
  }

  async function handleDeletePayment(id: number) {
    await deletePayment(id);
    onChanged();
  }

  function startEditTransaction(t: Transaction) {
    setEditingId(`t-${t.id}`);
    setEditForm({
      description: t.description,
      notes: t.notes || '',
      amount: (t.amount_cents / 100).toFixed(2),
      date: t.date.slice(0, 10),
      paidBy: t.paid_by,
      splitUser1Percent: String(t.split_user1_percent),
      splitMode: t.split_mode || 'percentage',
      splitOffsetUser1: t.split_mode === 'offset' ? (t.split_offset_user1_cents / 100).toFixed(2) : '',
      splitOffsetUser2: t.split_mode === 'offset' ? (t.split_offset_user2_cents / 100).toFixed(2) : '',
    });
  }

  function startEditPayment(p: Payment) {
    setEditingId(`p-${p.id}`);
    setEditForm({
      amount: (p.amount_cents / 100).toFixed(2),
      date: p.date.slice(0, 10),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEditTransaction(id: number) {
    const parsed = parseFloat(editForm.amount);
    if (!editForm.description || isNaN(parsed) || parsed <= 0) return;

    const mode = (editForm.splitMode || 'percentage') as 'percentage' | 'offset';
    const user1OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser1) || 0) * 100);
    const user2OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser2) || 0) * 100);
    const amountCents = Math.round(parsed * 100);
    const halfCents = Math.round(amountCents / 2);

    if (mode === 'offset') {
      const user1Share = halfCents + user1OffsetCents - user2OffsetCents;
      const user2Share = halfCents + user2OffsetCents - user1OffsetCents;
      if (user1Share < 0 || user2Share < 0) return;
    }

    setSaving(true);
    await updateTransaction(id, {
      description: editForm.description,
      notes: editForm.notes,
      amount: parsed,
      date: editForm.date,
      paidBy: editForm.paidBy,
      splitUser1Percent: mode === 'percentage' ? parseInt(editForm.splitUser1Percent) : undefined,
      splitMode: mode,
      splitOffsetUser1Cents: mode === 'offset' ? user1OffsetCents - user2OffsetCents : undefined,
      splitOffsetUser2Cents: mode === 'offset' ? user2OffsetCents - user1OffsetCents : undefined,
    });
    setEditingId(null);
    setEditForm({});
    setSaving(false);
    onChanged();
  }

  async function saveEditPayment(id: number) {
    const parsed = parseFloat(editForm.amount);
    if (isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    await updatePayment(id, {
      amount: parsed,
      date: editForm.date,
    });
    setEditingId(null);
    setEditForm({});
    setSaving(false);
    onChanged();
  }

  function getEditOffsetError(): string {
    if (editForm.splitMode !== 'offset') return '';
    const amountCents = Math.round((parseFloat(editForm.amount) || 0) * 100);
    const user1OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser1) || 0) * 100);
    const user2OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser2) || 0) * 100);
    const halfCents = Math.round(amountCents / 2);
    const user1Share = halfCents + user1OffsetCents - user2OffsetCents;
    const user2Share = halfCents + user2OffsetCents - user1OffsetCents;
    if (amountCents > 0 && (user1Share < 0 || user2Share < 0)) {
      return 'Offsets exceed the total amount';
    }
    return '';
  }

  if (items.length === 0) {
    return <p className="empty-list">No transactions yet.</p>;
  }

  return (
    <div className="transaction-list">
      <ul>
        {items.map((item) => {
          if (item.type === 'transaction') {
            const t = item.data;
            const isEditing = editingId === `t-${t.id}`;

            if (isEditing) {
              const editMode = editForm.splitMode || 'percentage';
              const editAmountCents = Math.round((parseFloat(editForm.amount) || 0) * 100);
              const editUser1OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser1) || 0) * 100);
              const editUser2OffsetCents = Math.round((parseFloat(editForm.splitOffsetUser2) || 0) * 100);
              const editHalf = Math.round(editAmountCents / 2);
              const editUser1Share = editHalf + editUser1OffsetCents - editUser2OffsetCents;
              const editUser2Share = editHalf + editUser2OffsetCents - editUser1OffsetCents;
              const editOffsetError = getEditOffsetError();

              return (
                <li key={`t-${t.id}`} className="list-item transaction-item">
                  <div className="edit-form-inline">
                    <div className="paid-by-toggle">
                      <label>Paid by:</label>
                      <div className="split-mode-toggle">
                        <button type="button" className={editForm.paidBy === 'user1' ? 'active' : ''} onClick={() => setEditForm({ ...editForm, paidBy: 'user1' })}>{user1Name}</button>
                        <button type="button" className={editForm.paidBy === 'user2' ? 'active' : ''} onClick={() => setEditForm({ ...editForm, paidBy: 'user2' })}>{user2Name}</button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Notes"
                    />
                    <div className="amount-input-wrapper">
                      <span className="amount-prefix">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={editForm.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) setEditForm({ ...editForm, amount: val });
                        }}
                      />
                    </div>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                    <div className="split-mode-toggle">
                      <button type="button" className={editMode === 'percentage' ? 'active' : ''} onClick={() => setEditForm({ ...editForm, splitMode: 'percentage' })}>
                        Percentage
                      </button>
                      <button type="button" className={editMode === 'offset' ? 'active' : ''} onClick={() => setEditForm({ ...editForm, splitMode: 'offset' })}>
                        + Offset
                      </button>
                    </div>
                    <div className="split-area">
                      <div className="split-select" style={editMode !== 'percentage' ? { visibility: 'hidden' } : undefined}>
                        <div className="split-inputs">
                          <label>{user1Name}:</label>
                          <div className="percent-input-wrapper">
                            <input
                              type="number"
                              value={editForm.splitUser1Percent}
                              onChange={(e) => {
                                const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setEditForm({ ...editForm, splitUser1Percent: String(v) });
                              }}
                              min="0"
                              max="100"
                            />
                            <span className="percent-suffix">%</span>
                          </div>
                          <label>{user2Name}:</label>
                          <span>{100 - (parseInt(editForm.splitUser1Percent) || 0)}%</span>
                        </div>
                      </div>
                      <div className="split-select" style={editMode !== 'offset' ? { visibility: 'hidden' } : undefined}>
                        <div className="split-offset-inputs">
                          <div className="split-offset-input">
                            <label>{user1Name}: +$</label>
                            <input
                              type="number"
                              value={editForm.splitOffsetUser1}
                              onChange={(e) => setEditForm({ ...editForm, splitOffsetUser1: e.target.value })}
                              step="0.01"
                              disabled={!editAmountCents}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="split-offset-input">
                            <label>{user2Name}: +$</label>
                            <input
                              type="number"
                              value={editForm.splitOffsetUser2}
                              onChange={(e) => setEditForm({ ...editForm, splitOffsetUser2: e.target.value })}
                              step="0.01"
                              disabled={!editAmountCents}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        {editAmountCents > 0 && !editOffsetError && (
                          <div className="split-preview">
                            {u1Short}: ${(editUser1Share / 100).toFixed(2)} / {u2Short}: ${(editUser2Share / 100).toFixed(2)}
                          </div>
                        )}
                        {editOffsetError && <div className="split-error">{editOffsetError}</div>}
                      </div>
                    </div>
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => saveEditTransaction(t.id)} disabled={saving || !!editOffsetError}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                </li>
              );
            }

            let user1Cents: number;
            if (t.split_mode === 'offset') {
              user1Cents = Math.round(t.amount_cents / 2) + t.split_offset_user1_cents;
            } else if (t.split_extra_to) {
              // Odd-cent 50/50: split_extra_to decides who gets the extra penny
              const half = Math.floor(t.amount_cents / 2);
              user1Cents = t.split_extra_to === 'user1' ? half + 1 : half;
            } else {
              user1Cents = Math.round(t.amount_cents * t.split_user1_percent / 100);
            }
            const user2Cents = t.amount_cents - user1Cents;
            const splitDisplay = `${u1Short}: ${formatDollars(user1Cents)} / ${u2Short}: ${formatDollars(user2Cents)}`;

            return (
              <li key={`t-${t.id}`} className="list-item transaction-item">
                <div className="item-main">
                  <div className="item-description">
                    <strong>{t.description}</strong>
                    {t.notes && <span className="notes"> — {t.notes}</span>}
                  </div>
                  <div className="item-details">
                    <span className="item-amount">{formatDollars(t.amount_cents)}</span>
                    <span className="item-meta">
                      paid by {displayName(t.paid_by, user1Name, user2Name)} &middot; {formatDate(t.date)}
                      {' '}&middot; {splitDisplay}
                    </span>
                  </div>
                </div>
                <button
                  className="edit-btn"
                  onClick={() => startEditTransaction(t)}
                  title="Edit"
                >
                  &#9998;
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTransaction(t.id)}
                  title="Delete"
                >
                  &times;
                </button>
              </li>
            );
          } else {
            const p = item.data;
            const isEditing = editingId === `p-${p.id}`;

            if (isEditing) {
              return (
                <li key={`p-${p.id}`} className="list-item payment-item">
                  <div className="edit-form-inline">
                    <div className="amount-input-wrapper">
                      <span className="amount-prefix">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={editForm.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) setEditForm({ ...editForm, amount: val });
                        }}
                      />
                    </div>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => saveEditPayment(p.id)} disabled={saving}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={`p-${p.id}`} className="list-item payment-item">
                <div className="item-main">
                  <div className="item-description">
                    <strong>Payment</strong>
                  </div>
                  <div className="item-details">
                    <span className="item-amount">{formatDollars(p.amount_cents)}</span>
                    <span className="item-meta">
                      {displayName(p.paid_by, user1Name, user2Name)} paid {displayName(p.paid_to, user1Name, user2Name)} &middot;{' '}
                      {formatDate(p.date)}
                    </span>
                  </div>
                </div>
                <button
                  className="edit-btn"
                  onClick={() => startEditPayment(p)}
                  title="Edit"
                >
                  &#9998;
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePayment(p.id)}
                  title="Delete"
                >
                  &times;
                </button>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}
