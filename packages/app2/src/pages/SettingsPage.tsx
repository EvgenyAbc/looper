import { useAppConfig } from '@looper/shared';

import settingsStyles from './SettingsPage.module.css';

export default function SettingsPage() {
  const config = useAppConfig();
  const endpoints = (config.endpoints ?? {}) as Record<string, string>;
  const features = (config.features ?? {}) as Record<string, boolean>;

  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="subtitle">Inspect menu-driven configuration surfaced from the shell.</p>

      <section className={settingsStyles.sectionBlock}>
        <h2 className="section-title">Feature flags</h2>
        <div className="mono-panel">
          <span className="mono-panel__label">features</span>
          <pre>{JSON.stringify(features, null, 2)}</pre>
        </div>
      </section>

      <section className={settingsStyles.sectionBlock}>
        <h2 className="section-title">API endpoints</h2>
        <div className="mono-panel">
          <span className="mono-panel__label">endpoints</span>
          <pre>{JSON.stringify(endpoints, null, 2)}</pre>
        </div>
      </section>

      <section className={settingsStyles.sectionBlock}>
        <h2 className="section-title">Registered apps</h2>
        <div className="mono-panel">
          <span className="mono-panel__label">apps</span>
          <pre>{JSON.stringify(config.apps ?? [], null, 2)}</pre>
        </div>
      </section>
    </div>
  );
}
