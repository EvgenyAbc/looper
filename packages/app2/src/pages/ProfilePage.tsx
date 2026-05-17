import { useAuth, useCounter, useTheme } from '@looper/shared';

import profileStyles from './ProfilePage.module.css';

function CounterWidget() {
  const { count, increment, decrement, reset } = useCounter();
  return (
    <div className="toolbar">
      <span className="toolbar__value" data-testid="counter-value">{count}</span>
      <button type="button" className="btn btn-secondary btn-sm" data-testid="counter-dec" onClick={decrement}>
        −
      </button>
      <button type="button" className="btn btn-secondary btn-sm" data-testid="counter-inc" onClick={increment}>
        +
      </button>
      <button type="button" className="btn btn-ghost btn-sm" data-testid="counter-reset" onClick={reset}>
        Reset
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page" data-testid="app2-remote-root">
      <h1>Profile</h1>
      <p className="subtitle">Identity and preferences from shared host context.</p>

      <article className="card">
        <h3>Account</h3>
        {user ? (
          <dl className="kv-list mt-md">
            <div className="kv-row">
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div className="kv-row">
              <dt>Role</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-md">No active session · use Sign in from the shell sidebar.</p>
        )}
        {user ? (
          <div className="mt-md">
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
              Sign out
            </button>
          </div>
        ) : null}
        <div className="mt-lg">
          <dl className="kv-list">
            <div className="kv-row">
              <dt>Appearance</dt>
              <dd>
                <strong>{theme}</strong>
                {' '}
                <button type="button" className="btn btn-ghost btn-sm" onClick={toggleTheme}>Toggle</button>
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <article className="card counter-card mt-lg">
        <h3 className={profileStyles.counterHeading}>Shared counter (host context)</h3>
        <p>Same singleton as the shell dashboard; changes propagate across remotes.</p>
        <CounterWidget />
      </article>
    </div>
  );
}
