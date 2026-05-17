import { expect,test } from '@playwright/test';

import { emulateSlow3G } from './helpers/network';

test.describe('production: remote navigation (Slow 3G)', () => {
  test('navigates App1 to App2 under throttled network', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('.shell-layout')).toBeVisible({ timeout: 45_000 });

    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByTestId('app1-remote-shell')).toBeVisible({ timeout: 60_000 });

    await emulateSlow3G(page);
    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByTestId('app2-remote-shell')).toBeVisible({ timeout: 120_000 });
  });
});

test.describe.configure({ timeout: 150_000 });
