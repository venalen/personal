import { User, Balance } from '../types';

interface Props {
  currentUser: User;
  balance: Balance | null;
  user1Name: string;
  user2Name: string;
}

export default function BalanceSummary({ currentUser, balance, user1Name, user2Name }: Props) {
  if (!balance) return <div className="balance-summary">Loading...</div>;

  const { balanceCents } = balance;
  const dollars = Math.abs(balanceCents / 100).toFixed(2);
  const otherName = currentUser === 'user1' ? user2Name : user1Name;

  let message: string;
  let className = 'balance-summary';

  if (balanceCents === 0) {
    message = 'All settled up!';
    className += ' settled';
  } else if (
    (balanceCents > 0 && currentUser === 'user1') ||
    (balanceCents < 0 && currentUser === 'user2')
  ) {
    // Other person owes current user
    message = `${otherName} owes you $${dollars}`;
    className += ' owed-to-you';
  } else {
    // Current user owes other person
    message = `You owe ${otherName} $${dollars}`;
    className += ' you-owe';
  }

  return (
    <div className={className}>
      <h2>{message}</h2>
    </div>
  );
}
