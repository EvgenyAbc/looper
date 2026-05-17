import { useAuth, useTheme } from '@looper/shared';

import { WidgetSlot } from '../components/WidgetSlot';

import styles from './HomePage.module.css';

export function HomePage() {
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page home-page">
      <h1>Looper shell</h1>
      <p className={`subtitle ${styles.lead}`}>
        Module Federation runtime UI — React 19 and React Router 7 host.
        <span className={styles.badge}>Hosted remotes</span>
      </p>

      <div className="card-grid">
        <article className="card">
          <h3>Runtime modules</h3>
          <p>
            Federation remotes load from menu configuration and <code>init()</code> —
            extend with new URLs without rebuilding the shell.
          </p>
        </article>
        <article className="card">
          <h3>Appearance</h3>
          <p>
            Theme: <strong>{theme}</strong> · palette follows system-like contrast using CSS variables.
          </p>
          <button type="button" className="btn btn-secondary btn-sm mt-sm" onClick={toggleTheme}>
            Switch appearance
          </button>
        </article>
        <article className="card">
          <h3>Session</h3>
          <p>
            {auth.isLoading
              ? 'Checking session…'
              : auth.isAuthenticated
                ? `Signed in as ${auth.user?.username}`
                : 'Guest — open Sign in from the sidebar to continue.'}
          </p>
        </article>
        <article className="card">
          <h3>Bundling</h3>
          <p>
            Aggressive tree-shaking: <code>sideEffects</code>, <code>innerGraph</code>, and SWC for the host and remotes.
          </p>
        </article>
        <article className="card">
          <h3>App 1</h3>
          <p>
            Nested routing under <code>/app1/*</code>; sub-navigation inside the remote bundle.
          </p>
        </article>
        <article className="card">
          <h3>App 2</h3>
          <p>Profile and settings areas with shared contexts from the host.</p>
        </article>
      </div>

      <WidgetSlot slot="home" />
    </div>
  );
}
