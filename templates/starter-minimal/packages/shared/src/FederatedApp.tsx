import { type ReactNode,Suspense } from 'react';
import { useLocation } from 'react-router';

import { FederatedMount } from './FederatedMount';
import { RemoteMountBaseProvider } from './RemoteMountBaseContext';
import { useRemoteSplat } from './RemoteSplatContext';
import { menuRemoteBaseFromPath } from './useEmbedRelativeLocation';
import { joinRemotePath, useLeafPathnameBase } from './useLeafPathnameBase';

export interface FederatedEmbedConfig {
  remoteName: string;
  entry: string;
  /** URL segment under the parent splat; must match `<Route path="{mountSegment}/*" />`. */
  mountSegment: string;
  modulePath?: string;
  loadingLabel?: string;
}

export interface FederatedAppProps {
  config: FederatedEmbedConfig;
  fallback?: ReactNode;
}

/**
 * Mounts an embed MF remote inside a menu-remote (e.g. app2 under shell `/app2/*`).
 * Sets `RemoteMountBaseProvider` for F5-safe nested Routes in the child remote.
 */
export function FederatedApp({ config, fallback }: FederatedAppProps) {
  const { pathname } = useLocation();
  const shellSplat = useRemoteSplat();
  const leafBase = useLeafPathnameBase({ scope: 'outermost' });
  const hostBase = shellSplat !== null ? menuRemoteBaseFromPath(pathname, shellSplat) : leafBase;
  const embedBase = joinRemotePath(hostBase, config.mountSegment);

  const loading =
    fallback ?? (
      <div className="remote-loading">
        Loading {config.loadingLabel ?? config.remoteName}…
      </div>
    );

  return (
    <RemoteMountBaseProvider base={embedBase}>
      <Suspense fallback={loading}>
        <FederatedMount
          remoteName={config.remoteName}
          entry={config.entry}
          modulePath={config.modulePath ?? './App'}
        />
      </Suspense>
    </RemoteMountBaseProvider>
  );
}
