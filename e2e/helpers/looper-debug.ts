import type { Page } from '@playwright/test';

/** Per-step ceiling while waiting for a `[looper]` marker (fail fast vs blind 60s). */
export const LOOPER_DEBUG_STEP_MS = 12_000;

export const LooperDebug = {
  bootstrapStart: '[looper] bootstrap:start',
  shellReady: '[looper] shell:ready',
  remoteLoaded: (name: string) => `[looper] remote:${name}:loaded`,
  embedLoaded: (name: string) => `[looper] embed:${name}:loaded`,
  pageReady: (id: string) => `[looper] page:${id}:ready`,
} as const;

function looperDebugKey(marker: string): string {
  return marker.startsWith('[looper] ') ? marker.slice('[looper] '.length) : marker;
}

async function looperDebugSeen(page: Page): Promise<string[]> {
  return page.evaluate(() => [...((window as Window & { __looperDebug?: Set<string> }).__looperDebug ?? [])]);
}

/** Wait until runtime records a `[looper]` marker (`window.__looperDebug`). */
export async function waitForLooperDebug(
  page: Page,
  marker: string,
  timeoutMs = LOOPER_DEBUG_STEP_MS,
): Promise<void> {
  const key = looperDebugKey(marker);
  try {
    await page.waitForFunction(
      (k) => {
        const bag = (window as Window & { __looperDebug?: Set<string> }).__looperDebug;
        return bag?.has(k) ?? false;
      },
      key,
      { timeout: timeoutMs },
    );
  } catch {
    const seen = await looperDebugSeen(page);
    throw new Error(`Timed out waiting for ${marker}; seen: [${seen.join(', ')}]`);
  }
}

/** Navigate, then wait for markers in order (register waits after goto — navigation resets pre-goto waiters). */
export async function gotoWithLooper(
  page: Page,
  path: string,
  markers: string[],
): Promise<void> {
  await page.goto(path, { waitUntil: 'load' });
  for (const marker of markers) {
    await waitForLooperDebug(page, marker);
  }
}

/** Start before an in-app action (click / reload) on the same document. */
export function armLooperDebug(page: Page, marker: string): Promise<void> {
  return waitForLooperDebug(page, marker);
}
