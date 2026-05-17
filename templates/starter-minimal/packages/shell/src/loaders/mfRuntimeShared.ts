import type { init } from '@module-federation/enhanced/runtime';

type RuntimeShared = NonNullable<Parameters<typeof init>[0]['shared']>;

const reactVersion = '^19.0.0';
const routerVersion = '^7.0.0';

const eagerSingleton = (requiredVersion: string) => ({
  singleton: true,
  requiredVersion,
  eager: true,
} as const);

/** Runtime `init({ shared })` — mirrors build-time `sharedEagerHost` in rspack.shared.mjs. */
export const shellRuntimeShared: RuntimeShared = {
  react: {
    lib: () => import('react'),
    shareConfig: eagerSingleton(reactVersion),
  },
  'react-dom': {
    lib: () => import('react-dom'),
    shareConfig: eagerSingleton(reactVersion),
  },
  'react/jsx-runtime': {
    lib: () => import('react/jsx-runtime'),
    shareConfig: eagerSingleton(reactVersion),
  },
  'react/jsx-dev-runtime': {
    lib: () => import('react/jsx-dev-runtime'),
    shareConfig: eagerSingleton(reactVersion),
  },
  'react-router': {
    lib: () => import('react-router'),
    shareConfig: eagerSingleton(routerVersion),
  },
};
