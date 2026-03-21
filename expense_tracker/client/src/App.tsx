import { useState, useEffect } from 'react';
import { User } from './types';
import { fetchConfig } from './api';
import UserSelector from './components/UserSelector';
import Dashboard from './components/Dashboard';

const PASSPHRASE_HASH = 'd5246d4c00948ec900b234a8ccf2aa4b6a7c9cd4493171065be257d29a432dfe';

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('authenticated') === 'true'
  );
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [user1Name, setUser1Name] = useState('User 1');
  const [user2Name, setUser2Name] = useState('User 2');

  useEffect(() => {
    if (authenticated) {
      fetchConfig().then((config) => {
        setUser1Name(config.user1Name);
        setUser2Name(config.user2Name);
      });
    }
  }, [authenticated]);

  async function handlePassphraseSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hash = await sha256(passphrase);
    if (hash === PASSPHRASE_HASH) {
      setAuthenticated(true);
      sessionStorage.setItem('authenticated', 'true');
      setError('');
    } else {
      setError('Wrong passphrase');
    }
  }

  if (!authenticated) {
    return (
      <div className="passphrase-screen">
        <h1 className="app-title">Better Have My Money</h1>
        <form onSubmit={handlePassphraseSubmit}>
          <div className="passphrase-input-wrapper">
            <input
              type={showPassphrase ? 'text' : 'password'}
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowPassphrase(!showPassphrase)}
              tabIndex={-1}
            >
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit">Enter</button>
        </form>
        {error && <p className="passphrase-error">{error}</p>}
      </div>
    );
  }

  if (!currentUser) {
    return <UserSelector onSelect={setCurrentUser} user1Name={user1Name} user2Name={user2Name} />;
  }

  return (
    <Dashboard
      currentUser={currentUser}
      onSwitchUser={() => setCurrentUser(currentUser === 'user1' ? 'user2' : 'user1')}
      user1Name={user1Name}
      user2Name={user2Name}
    />
  );
}
