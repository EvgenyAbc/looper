import { init } from '@module-federation/enhanced/runtime';

import type { AppConfig } from '@looper/shared';
import { appMfContainerName } from '@looper/shared';

import { shellRuntimeShared } from './mfRuntimeShared';

let mfInitialized = false;
let cachedConfig: AppConfig | null = null;
let menuRoutesPatched = false;
let patchMenuRoutes: ((config: AppConfig) => void) | null = null;

export function registerMenuRoutePatcher(patcher: (config: AppConfig) => void): void {
  patchMenuRoutes = patcher;
}

export function areMenuRoutesPatched(): boolean {
  return menuRoutesPatched;
}

export function markMenuRoutesPatched(): void {
  menuRoutesPatched = true;
}

export async function fetchMenuConfig(): Promise<AppConfig> {
  const response = await fetch('/mock-menu.json');
  if (!response.ok) {
    throw new Response('Failed to load menu configuration', { status: response.status });
  }
  return response.json() as Promise<AppConfig>;
}

export function initMfRemotes(menuData: AppConfig): void {
  if (mfInitialized) return;

  const remotesDedup = new Map<string, { name: string; entry: string; alias: string }>();
  for (const app of menuData.apps) {
    const name = appMfContainerName(app);
    if (!remotesDedup.has(name)) {
      remotesDedup.set(name, {
        name,
        entry: app.entry,
        alias: name,
      });
    }
  }

  // System remotes (e.g. ui-looper) register lazily via @looper/shared — shell boots without :3030.

  init({
    name: 'shell',
    shareStrategy: 'loaded-first',
    shared: shellRuntimeShared,
    remotes: [...remotesDedup.values()],
  });

  mfInitialized = true;
}

function ensureMenuRoutes(config: AppConfig): void {
  if (menuRoutesPatched || !patchMenuRoutes) return;
  patchMenuRoutes(config);
  menuRoutesPatched = true;
}

/** Fetch menu, init MF remotes once, patch host routes, cache for loader. */
export async function loadShellRuntime(): Promise<AppConfig> {
  if (cachedConfig) {
    ensureMenuRoutes(cachedConfig);
    return cachedConfig;
  }
  const menuData = await fetchMenuConfig();
  initMfRemotes(menuData);
  ensureMenuRoutes(menuData);
  cachedConfig = menuData;
  return menuData;
}
