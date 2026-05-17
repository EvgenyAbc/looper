import { expect,test } from '@playwright/test';

test.describe('production: remote subnav under /appX/*', () => {
  test('app2 Profile and Settings toggle without stacking path segments', async ({ page }) => {
    await page.goto('/app2', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('app2-remote-shell')).toBeVisible({ timeout: 60_000 });

    const subnav = page.getByRole('navigation', { name: 'App 2 sections' });

    await subnav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/app2\/settings$/);

    await subnav.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/app2\/?$/);

    await subnav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/app2\/settings$/);
    await expect(page.getByTestId('app2-remote-shell')).toBeVisible();
  });

  test('app1 Dashboard and Analytics toggle without stacking segments', async ({ page }) => {
    await page.goto('/app1', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('app1-remote-shell')).toBeVisible({ timeout: 60_000 });

    const subnav = page.getByRole('navigation', { name: 'App 1 sections' });

    await subnav.getByRole('link', { name: 'Analytics' }).click();
    await expect(page).toHaveURL(/\/app1\/analytics$/);

    await subnav.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/app1\/?$/);

    await subnav.getByRole('link', { name: 'Analytics' }).click();
    await expect(page).toHaveURL(/\/app1\/analytics$/);
  });
});
