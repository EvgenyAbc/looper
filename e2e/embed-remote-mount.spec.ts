import { expect, type Page,test } from '@playwright/test';

import { armLooperDebug, gotoWithLooper, LooperDebug, waitForLooperDebug } from './helpers/looper-debug';

const expectVisible = { timeout: 5_000 };

async function openApp4FromApp2(page: Page) {
  await gotoWithLooper(page, '/app2', [
    LooperDebug.shellReady,
    LooperDebug.remoteLoaded('app2'),
  ]);
  await expect(page.getByTestId('app2-remote-shell')).toBeVisible(expectVisible);

  const app2Subnav = page.getByRole('navigation', { name: 'App 2 sections' });
  const embedReady = armLooperDebug(page, LooperDebug.embedLoaded('app4'));
  await app2Subnav.getByRole('link', { name: 'App four' }).click();
  await embedReady;
  await expect(page).toHaveURL(/\/app2\/app4\/?$/);
  await expect(page.getByTestId('app4-remote-shell')).toBeVisible(expectVisible);
}

async function waitForDeepEmbedComponents(page: Page) {
  await gotoWithLooper(page, '/app2/app4/components', [
    LooperDebug.shellReady,
    LooperDebug.remoteLoaded('app2'),
    LooperDebug.embedLoaded('app4'),
    LooperDebug.pageReady('app4:components'),
  ]);
  await expect(page.getByTestId('app2-remote-shell')).toBeVisible(expectVisible);
  await expect(page.getByTestId('app4-components')).toBeVisible(expectVisible);
}

test('home widget (app3 ./Widget) loads without duplicate React jsx runtime', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await gotoWithLooper(page, '/', [LooperDebug.shellReady, LooperDebug.remoteLoaded('app3')]);
  await expect(page.getByTestId('app3-widget-root')).toBeVisible(expectVisible);
  expect(errors.filter((m) => m.includes('getOwner'))).toEqual([]);
});

test.describe('Embed remote mounted in parent (app2 → app4)', () => {
  test('app4 nested subnav toggles Dashboard and Components', async ({ page }) => {
    await openApp4FromApp2(page);
    await expect(page.getByTestId('app4-dashboard')).toBeVisible(expectVisible);

    const app4Subnav = page.getByRole('navigation', { name: 'App four sections' });
    const componentsReady = armLooperDebug(page, LooperDebug.pageReady('app4:components'));
    await app4Subnav.getByRole('link', { name: 'Components' }).click();
    await componentsReady;
    await expect(page).toHaveURL(/\/app2\/app4\/components$/);
    await expect(page.getByTestId('app4-components')).toBeVisible(expectVisible);

    const dashboardReady = armLooperDebug(page, LooperDebug.pageReady('app4:dashboard'));
    await app4Subnav.getByRole('link', { name: 'Dashboard' }).click();
    await dashboardReady;
    await expect(page).toHaveURL(/\/app2\/app4\/?$/);
    await expect(page.getByTestId('app4-dashboard')).toBeVisible(expectVisible);
  });

  test('app2 subnav opens embed section from profile', async ({ page }) => {
    await openApp4FromApp2(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible(expectVisible);
  });

  test('hard refresh on deep embed URL loads Components', async ({ page }) => {
    await waitForDeepEmbedComponents(page);
    await expect(page.getByRole('heading', { name: 'Components' })).toBeVisible(expectVisible);
  });

  test('reload on deep embed URL keeps Components', async ({ page }) => {
    await openApp4FromApp2(page);
    const app4Subnav = page.getByRole('navigation', { name: 'App four sections' });
    const componentsReady = armLooperDebug(page, LooperDebug.pageReady('app4:components'));
    await app4Subnav.getByRole('link', { name: 'Components' }).click();
    await componentsReady;
    await expect(page).toHaveURL(/\/app2\/app4\/components$/);

    await page.reload({ waitUntil: 'load' });
    await waitForLooperDebug(page, LooperDebug.shellReady);
    await waitForLooperDebug(page, LooperDebug.remoteLoaded('app2'));
    await waitForLooperDebug(page, LooperDebug.embedLoaded('app4'));
    await waitForLooperDebug(page, LooperDebug.pageReady('app4:components'));
    await expect(page.getByTestId('app2-remote-shell')).toBeVisible(expectVisible);
    await expect(page.getByTestId('app4-components')).toBeVisible(expectVisible);
  });
});
