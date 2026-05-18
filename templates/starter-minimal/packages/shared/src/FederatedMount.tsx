import { type ComponentType, use, useMemo } from 'react';
import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import { looperDebugEmbedLoaded } from './looperDebug';

const registeredRemoteNames = new Set<string>();

function ensureRemoteRegistered(remoteName: string, entry: string): void {
  if (registeredRemoteNames.has(remoteName)) return;
  registerRemotes([
    {
      name: remoteName,
      entry,
      alias: remoteName,
    },
  ]);
  registeredRemoteNames.add(remoteName);
}

export interface FederatedMountProps {
  remoteName: string;
  modulePath: string;
  /** When set, registers the remote at runtime (embed / nested mount). */
  entry?: string;
}

/**
 * Suspends until a federated expose loads. Wrap in `<Suspense>`.
 * Pass `entry` when the remote is not registered by shell `init()`.
 * Parent route should use `path="segment/*"` so nested Routes inside the remote re-match without remount keys.
 */
export function FederatedMount({ remoteName, modulePath, entry }: FederatedMountProps) {
  const normalizedPath = modulePath.replace(/^\.\//, '');
  const loadPromise = useMemo(() => {
    if (entry) {
      ensureRemoteRegistered(remoteName, entry);
    }
    return loadRemote<{ default: ComponentType }>(`${remoteName}/${normalizedPath}`).then((mod) => {
      if (mod) looperDebugEmbedLoaded(remoteName);
      return mod;
    });
  }, [remoteName, normalizedPath, entry]);
  const Module = use(loadPromise);
  if (!Module) return <div>Failed to load remote module</div>;
  return <Module.default />;
}
