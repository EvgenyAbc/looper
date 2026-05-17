import type { FederatedEmbedConfig } from '@looper/shared';

export const APP4_REMOTE = {
  remoteName: 'app4',
  entry: 'http://localhost:3005/remoteEntry.js',
  mountSegment: 'app4',
  modulePath: './App',
  loadingLabel: 'App four',
} as const satisfies FederatedEmbedConfig;
