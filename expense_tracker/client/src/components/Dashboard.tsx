import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Transaction, Payment, Balance } from '../types';
import { fetchTransactions, fetchPayments, fetchBalance } from '../api';
import BalanceSummary from './BalanceSummary';
import TransactionForm from './TransactionForm';
import PaymentForm from './PaymentForm';
import TransactionList from './TransactionList';

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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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

  const loadData = useCallback(async () => {
    const [txs, pays, bal] = await Promise.all([
      fetchTransactions(),
      fetchPayments(),
      fetchBalance(),
    ]);
    setTransactions(txs);
    setPayments(pays);
    setBalance(bal);
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
      <div className="history-panel">
        <div className="month-tabs">
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
          transactions={filteredTransactions}
          payments={filteredPayments}
          onChanged={loadData}
          user1Name={user1Name}
          user2Name={user2Name}
        />
      </div>
    </div>
  );
}
