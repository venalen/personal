import { useState } from 'react';
import { User, RecurringRule } from '../types';
import { deleteRecurring, activateRecurring, deactivateRecurring } from '../api';
import RecurringForm from './RecurringForm';

interface Props {
  currentUser: User;
  rules: RecurringRule[];
  onChanged: () => void;
  user1Name: string;
  user2Name: string;
}

export default function RecurringList({ currentUser, rules, onChanged, user1Name, user2Name }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  function resolveName(user: string) {
    return user === 'user1' ? user1Name : user2Name;
  }

  async function handleDelete(id: number) {
    await deleteRecurring(id);
    onChanged();
  }

  async function handleToggleActive(rule: RecurringRule) {
    if (rule.active) {
      await deactivateRecurring(rule.id);
    } else {
      await activateRecurring(rule.id);
    }
    onChanged();
  }

  function handleEdit(rule: RecurringRule) {
    setEditingRule(rule);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingRule(null);
    onChanged();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingRule(null);
  }

  if (showForm) {
    return (
      <RecurringForm
        currentUser={currentUser}
        onSaved={handleSaved}
        onCancel={handleCancel}
        user1Name={user1Name}
        user2Name={user2Name}
        editingRule={editingRule}
      />
    );
  }

  return (
    <div className="recurring-section">
      <div className="recurring-header">
        <h3>Recurring</h3>
        <button className="add-recurring-btn" onClick={() => setShowForm(true)}>+ Add</button>
      </div>
      {rules.length === 0 ? (
        <p className="recurring-empty">No recurring rules yet.</p>
      ) : (
        <ul className="recurring-list">
          {rules.map((rule) => (
            <li key={rule.id} className={`recurring-item${rule.active ? '' : ' inactive'}`}>
              <div className="recurring-item-main">
                <span className="recurring-desc">{rule.description}</span>
                <span className="recurring-amount">${(rule.amount_cents / 100).toFixed(2)}</span>
              </div>
              <div className="recurring-item-details">
                <span>Day {rule.day_of_month}</span>
                <span>Paid by {resolveName(rule.paid_by)}</span>
                <span>
                  {rule.split_mode === 'percentage'
                    ? `${rule.split_user1_percent}/${100 - rule.split_user1_percent}`
                    : 'Offset'}
                </span>
                <span className="recurring-next-date">
                  Next: {new Date(rule.next_occurrence.slice(0, 10) + 'T00:00:00').toLocaleDateString()}
                </span>
              </div>
              <div className="recurring-item-actions">
                <button className="recurring-action-btn" onClick={() => handleEdit(rule)}>Edit</button>
                <button className="recurring-action-btn" onClick={() => handleToggleActive(rule)}>
                  {rule.active ? 'Pause' : 'Resume'}
                </button>
                <button className="recurring-action-btn delete" onClick={() => handleDelete(rule.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
