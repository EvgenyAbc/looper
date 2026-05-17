import { type ComponentType, type ReactNode,use, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { loadRemote } from '@module-federation/enhanced/runtime';

import { looperDebugRemoteLoaded,RemoteSplatProvider } from '@looper/shared';

interface RemotePageProps {
  remoteName: string;
  modulePath: string;
}

function splatFromParams(params: Record<string, string | undefined>): string {
  if (typeof params['*'] === 'string') return params['*'];
  if (typeof params.splat === 'string') return params.splat;
  return '';
}

function RemoteLoadedMarker({ remoteName, children }: { remoteName: string; children: ReactNode }) {
  useEffect(() => {
    looperDebugRemoteLoaded(remoteName);
  }, [remoteName]);
  return <>{children}</>;
}

/**
 * Dynamically loads a remote federated module at runtime.
 * Uses React 19's use() hook to suspend until the module is loaded.
 *
 * The remote must already be registered via init() or registerRemotes()
 * before this component attempts to load it.
 */
function RemotePageInner({ remoteName, modulePath }: RemotePageProps) {
  const params = useParams();
  const splat = splatFromParams(params as Record<string, string | undefined>);
  const normalizedPath = modulePath.replace(/^\.\//, '');
  const loadPromise = useMemo(
    () => loadRemote<{ default: ComponentType }>(`${remoteName}/${normalizedPath}`),
    [remoteName, normalizedPath],
  );
  const Module = use(loadPromise);
  if (!Module) return <div>Failed to load remote module</div>;
  return (
    <RemoteLoadedMarker remoteName={remoteName}>
      <RemoteSplatProvider splat={splat}>
        <Module.default />
      </RemoteSplatProvider>
    </RemoteLoadedMarker>
  );
}

export function RemotePage(props: RemotePageProps) {
  const normalizedPath = props.modulePath.replace(/^\.\//, '');
  const isolateKey = `${props.remoteName}:${normalizedPath}`;
  return <RemotePageInner key={isolateKey} {...props} />;
}
