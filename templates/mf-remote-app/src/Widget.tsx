/** Optional MF expose for shell widget slots — use menu `displayMode: "widget"`, `module: "./Widget"`. */
export default function StarterWidget() {
  return (
    <div>
      <strong>Widget</strong>
      <p>Expose <code>./Widget</code> from remote <code>__REMOTE_NAME__</code>.</p>
    </div>
  );
}
