/**
 * Shown while the shell route loader fetches menu config and registers MF remotes.
 */
export function ShellLoadingFallback() {
  return (
    <div
      className="remote-loading remote-loading--page shell-loading"
      role="status"
      aria-busy="true"
      aria-label="Loading shell"
      data-testid="shell-loading"
    >
      <div className="remote-loading__spinner" aria-hidden="true" />
      <span className="remote-loading__label">Loading shell…</span>
    </div>
  );
}
