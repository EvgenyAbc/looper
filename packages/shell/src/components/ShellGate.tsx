import { useEffect } from 'react';
import { Outlet, useLoaderData } from 'react-router';

import { type AppConfig,AppConfigContext, looperDebugShellReady } from '@looper/shared';

import { ShellLoadingFallback } from './ShellLoadingFallback';

function ShellReadyMarker() {
  useEffect(() => {
    looperDebugShellReady();
  }, []);
  return null;
}

/**
 * Root shell route: shows loading until menu config loader resolves, then provides AppConfig.
 * Menu splat routes are registered eagerly in router.tsx so deep links match on F5.
 */
export function ShellGate() {
  const config = useLoaderData() as AppConfig | undefined;

  // Do not gate on `navigation.state === 'loading'`: child navigations / F5 on deep
  // splat URLs revalidate the shell loader and would block the tree indefinitely.
  if (!config) {
    return <ShellLoadingFallback />;
  }

  return (
    <AppConfigContext.Provider value={config}>
      <ShellReadyMarker />
      <Outlet />
    </AppConfigContext.Provider>
  );
}
