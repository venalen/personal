import { User } from '../types';

interface Props {
  onSelect: (user: User) => void;
  user1Name: string;
  user2Name: string;
}

export default function UserSelector({ onSelect, user1Name, user2Name }: Props) {
  return (
    <div className="user-selector">
      <h1 className="app-title">Better Have My Money</h1>
      <p>Who are you?</p>
      <div className="user-buttons">
        <button onClick={() => onSelect('user1')}>{user1Name}</button>
        <button onClick={() => onSelect('user2')}>{user2Name}</button>
      </div>
    </div>
  );
}
