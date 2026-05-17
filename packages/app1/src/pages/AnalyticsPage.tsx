import { Button } from '@looper/shared';

import analyticsStyles from './AnalyticsPage.module.css';

export default function AnalyticsPage() {
  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="subtitle">Mock metrics for layout and navigation checks.</p>

      <div className="card-grid">
        <article className="card">
          <h3>Page views</h3>
          <p className="stat">127,890</p>
          <small>+12.3% vs previous month</small>
        </article>
        <article className="card">
          <h3>Conversion</h3>
          <p className="stat">3.45%</p>
          <small>+0.8 pp vs previous month</small>
        </article>
        <article className="card">
          <h3>Session length</h3>
          <p className="stat">4m 32s</p>
          <small>−0.5% vs previous month</small>
        </article>
      </div>

      <div className={`mt-lg ${analyticsStyles.footer}`}>
        <Button variant="primary" onClick={() => alert('Export is not wired in the demo.')}>
          Export report
        </Button>
      </div>
    </div>
  );
}
