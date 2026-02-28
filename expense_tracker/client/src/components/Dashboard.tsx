import { useState, useEffect, useCallback } from 'react';
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

export default function Dashboard({ currentUser, onSwitchUser, user1Name, user2Name }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);

  const displayName = currentUser === 'user1' ? user1Name : user2Name;

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
      <TransactionList
        currentUser={currentUser}
        transactions={transactions}
        payments={payments}
        onChanged={loadData}
        user1Name={user1Name}
        user2Name={user2Name}
      />
    </div>
  );
}
