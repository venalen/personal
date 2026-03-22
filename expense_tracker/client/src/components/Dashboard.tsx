import { useState, useEffect, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { User, Transaction, Payment, Balance, RecurringRule } from '../types';
import { fetchTransactions, fetchPayments, fetchBalance, fetchRecurring } from '../api';
import BalanceSummary from './BalanceSummary';
import TransactionForm from './TransactionForm';
import PaymentForm from './PaymentForm';
import TransactionList from './TransactionList';
import RecurringList from './RecurringList';

interface Props {
  currentUser: User;
  onSwitchUser: () => void;
  user1Name: string;
  user2Name: string;
}

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export default function Dashboard({ currentUser, onSwitchUser, user1Name, user2Name }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayName = currentUser === 'user1' ? user1Name : user2Name;

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add(currentMonth);
    for (const tx of transactions) {
      months.add(toYearMonth(tx.date));
    }
    for (const p of payments) {
      months.add(toYearMonth(p.date));
    }
    return Array.from(months).sort().reverse();
  }, [transactions, payments, currentMonth]);

  const activeMonth = selectedMonth ?? currentMonth;

  const filteredTransactions = useMemo(
    () => transactions.filter(tx => toYearMonth(tx.date) === activeMonth),
    [transactions, activeMonth]
  );

  const filteredPayments = useMemo(
    () => payments.filter(p => toYearMonth(p.date) === activeMonth),
    [payments, activeMonth]
  );

  const resolveName = useCallback((user: string) => user === 'user1' ? user1Name : user2Name, [user1Name, user2Name]);

  const searchedTransactions = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const items = transactions.map(t => ({
      ...t,
      _paidByName: resolveName(t.paid_by),
    }));
    const fuse = new Fuse(items, {
      keys: ['description', 'notes', '_paidByName'],
      threshold: 0.4,
    });
    return fuse.search(searchQuery).map(r => r.item as Transaction);
  }, [searchQuery, transactions, resolveName]);

  const searchedPayments = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const items = payments.map(p => ({
      ...p,
      _paidByName: resolveName(p.paid_by),
      _paidToName: resolveName(p.paid_to),
    }));
    const fuse = new Fuse(items, {
      keys: ['_paidByName', '_paidToName'],
      threshold: 0.4,
    });
    return fuse.search(searchQuery).map(r => r.item as Payment);
  }, [searchQuery, payments, resolveName]);

  const isSearching = searchQuery.trim().length > 0;

  const loadData = useCallback(async () => {
    const [txs, pays, bal, rules] = await Promise.all([
      fetchTransactions(),
      fetchPayments(),
      fetchBalance(),
      fetchRecurring(),
    ]);
    setTransactions(txs);
    setPayments(pays);
    setBalance(bal);
    setRecurringRules(rules);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="app-title">Better Have My Money</h1>
        <div className="user-info">
          <span>Logged in as <strong>{displayName}</strong></span>
          <button className="switch-btn" onClick={onSwitchUser}>Switch</button>
        </div>
      </header>
      <BalanceSummary currentUser={currentUser} balance={balance} user1Name={user1Name} user2Name={user2Name} />
      <div className="forms-row">
        <TransactionForm currentUser={currentUser} onCreated={loadData} user1Name={user1Name} user2Name={user2Name} />
        <PaymentForm currentUser={currentUser} onCreated={loadData} user1Name={user1Name} user2Name={user2Name} />
      </div>
      <RecurringList
        currentUser={currentUser}
        rules={recurringRules}
        onChanged={loadData}
        user1Name={user1Name}
        user2Name={user2Name}
      />
      <div className="history-panel">
        <input
          type="text"
          className="search-input"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="month-tabs" style={isSearching ? { display: 'none' } : undefined}>
          {availableMonths.map(ym => (
            <button
              key={ym}
              className={`month-tab${activeMonth === ym ? ' active' : ''}`}
              onClick={() => setSelectedMonth(ym === currentMonth ? null : ym)}
            >
              {formatMonthLabel(ym)}
            </button>
          ))}
        </div>
        <TransactionList
          currentUser={currentUser}
          transactions={isSearching ? (searchedTransactions ?? []) : filteredTransactions}
          payments={isSearching ? (searchedPayments ?? []) : filteredPayments}
          onChanged={loadData}
          user1Name={user1Name}
          user2Name={user2Name}
        />
      </div>
    </div>
  );
}
