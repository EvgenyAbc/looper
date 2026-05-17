import { createBrowserRouter } from 'react-router';

import type { AppConfig } from '@looper/shared';

import menuFallback from '../public/mock-menu.json';
import { ShellGate } from './components/ShellGate';
import { ShellLoadingFallback } from './components/ShellLoadingFallback';
import { ShellRoot } from './components/ShellRoot';
import { buildMenuPageRoutes } from './lib/buildMenuPageRoutes';
import { shellConfigLoader } from './loaders/shellConfigLoader';
import {
  areMenuRoutesPatched,
  loadShellRuntime,
  markMenuRoutesPatched,
  registerMenuRoutePatcher,
} from './loaders/shellRuntime';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

/** Eager menu routes so cold load / F5 on `/appX/...` matches before async loader patch. */
const initialMenuRoutes = buildMenuPageRoutes(menuFallback as AppConfig);
markMenuRoutesPatched();

function patchShellMenuRoutes(
  config: Parameters<typeof buildMenuPageRoutes>[0],
  patch: (routeId: string | null, routes: ReturnType<typeof buildMenuPageRoutes>) => void,
): void {
  if (areMenuRoutesPatched()) return;
  patch('shell-layout', buildMenuPageRoutes(config));
  markMenuRoutesPatched();
}

export const shellRouter = createBrowserRouter(
  [
    {
      path: '/',
      id: 'shell',
      loader: shellConfigLoader,
      element: <ShellGate />,
      hydrateFallbackElement: <ShellLoadingFallback />,
      children: [
        {
          id: 'shell-layout',
          element: <ShellRoot />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'login', element: <LoginPage /> },
            ...initialMenuRoutes,
          ],
        },
      ],
    },
  ],
  {
    async patchRoutesOnNavigation({ patch }) {
      const config = await loadShellRuntime();
      patchShellMenuRoutes(config, patch);
    },
  },
);

registerMenuRoutePatcher((config) => {
  patchShellMenuRoutes(config, (_routeId, routes) => {
    shellRouter.patchRoutes('shell-layout', routes);
  });
});
