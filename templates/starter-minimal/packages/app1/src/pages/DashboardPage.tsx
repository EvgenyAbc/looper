import { Button,useAppConfig, useCounter } from '@looper/shared';

import dashStyles from './DashboardPage.module.css';

function CounterWidget() {
  const { count, increment, decrement, reset } = useCounter();
  return (
    <div className="toolbar">
      <span className="toolbar__value" data-testid="counter-value">
        {count}
      </span>
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

export default function DashboardPage() {
  const config = useAppConfig();
  const featuresEnabled = (config.features as Record<string, boolean>)?.dashboard ?? true;

  if (!featuresEnabled) {
    return (
      <div className="page" data-testid="app1-remote-root">
        <div className="empty-state">The dashboard entry is hidden by feature configuration.</div>
      </div>
    );
  }

  return (
    <div className="page" data-testid="app1-remote-root">
      <h1>Dashboard</h1>
      <p className="subtitle">Overview from the <code>app1</code> remote.</p>

      <div className="card-grid">
        <article className="card" data-testid="app1-themed-card">
          <h3>Active users</h3>
          <p>1,234 signed in over the last 24 hours (mock).</p>
          <Button variant="primary" size="sm">Open list</Button>
        </article>
        <article className="card">
          <h3>Revenue</h3>
          <p>$45,678 month to date (mock).</p>
          <Button variant="secondary" size="sm">View summary</Button>
        </article>
        <article className="card">
          <h3>Orders</h3>
          <p>890 awaiting fulfillment (mock).</p>
          <Button variant="ghost" size="sm">Queue</Button>
        </article>
      </div>

      <article className={`card counter-card mt-lg`}>
        <h3 className={dashStyles.counterCardHeading}>Shared counter (host context)</h3>
        <p>
          If React context is shared across the federation boundary, this value matches the shell and other remotes.
        </p>
        <CounterWidget />
      </article>

      <div className="mono-panel mt-lg">
        <span className="mono-panel__label">Host configuration snapshot</span>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}
