import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className="page" data-testid="app3-remote-root">
      <h1>App three</h1>
      <p className="subtitle">Micro-frontend placeholder; add routes when you wire real features.</p>
      <article className={`card ${styles.leadCard}`}>
        <p>This remote is mounted under the shell layout and shares global styles from the host.</p>
      </article>
    </div>
  );
}
