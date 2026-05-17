import styles from './Widget.module.css';

/** Lightweight MF expose for shell widget slots (`module: ./Widget`). */
export default function App3Widget() {
  return (
    <div data-testid="app3-widget-root">
      <span className={styles.title}>App 3</span>
      <p className={styles.muted}>
        Remote <code>app3</code> · expose <code>./Widget</code> · shell <code>WidgetSlot</code>
      </p>
    </div>
  );
}
