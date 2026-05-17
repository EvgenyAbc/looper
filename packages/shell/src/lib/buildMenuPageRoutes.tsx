import { type ReactElement,Suspense } from 'react';
import type { RouteObject } from 'react-router';

import { type AppConfig, type AppMenuItem,appMfContainerName, isAppPage } from '@looper/shared';

import { RemoteLoadingFallback } from '../components/RemoteLoadingFallback';
import { RemotePage } from '../components/RemotePage';
import { NotFoundPage } from '../pages/NotFoundPage';

function menuRouteToPath(route: string): string {
  return route.replace(/^\//, '');
}

function remotePageElement(app: AppMenuItem): ReactElement {
  return (
    <Suspense fallback={<RemoteLoadingFallback variant="page" label={app.name} />}>
      <RemotePage
        remoteName={appMfContainerName(app)}
        modulePath={app.module ?? './App'}
      />
    </Suspense>
  );
}

export function buildMenuPageRoutes(config: AppConfig): RouteObject[] {
  const pageRoutes: RouteObject[] = config.apps
    .filter((app) => isAppPage(app) && Boolean(app.route))
    .map((app) => ({
      path: menuRouteToPath(app.route!),
      element: remotePageElement(app),
    }));

  return [...pageRoutes, { path: '*', element: <NotFoundPage /> }];
}
