interface RemoteLoadingFallbackProps {
  /** Shown visually and passed to aria-label for assistive tech. */
  label?: string;
  variant?: 'page' | 'widget';
}

/**
 * Fallback while `loadRemote` + Suspense resolve an MF expose.
 */
export function RemoteLoadingFallback({ label, variant = 'page' }: RemoteLoadingFallbackProps) {
  const rootClass = variant === 'page' ? 'remote-loading remote-loading--page' : 'remote-loading remote-loading--widget';
  const ariaLabel = label ? `Loading ${label}` : 'Loading remote module';

  return (
    <div className={rootClass} role="status" aria-busy="true" aria-label={ariaLabel}>
      <div className="remote-loading__spinner" aria-hidden />
      {label ? <span className="remote-loading__label">{label}</span> : null}
    </div>
  );
}
