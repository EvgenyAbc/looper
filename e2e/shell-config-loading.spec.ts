import { expect,test } from '@playwright/test';

import { emulateSlow3G } from './helpers/network';

test.describe('Shell menu config loading (Slow 3G)', () => {
  test('shows shell loading spinner until sidebar is ready', async ({ page }) => {
    await page.route('**/mock-menu.json', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.continue();
    });

    await emulateSlow3G(page);
    await page.goto('/', { waitUntil: 'commit' });

    const shellLoading = page.getByRole('status', { name: 'Loading shell' });
    await expect(shellLoading).toBeVisible({ timeout: 10_000 });

    const sidebar = page.getByTestId('shell-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('.shell-layout')).toBeVisible();

    await expect(shellLoading).toBeHidden({ timeout: 15_000 });
  });
});

test.describe.configure({ timeout: 60_000 });
