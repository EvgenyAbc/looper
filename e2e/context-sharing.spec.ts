import { expect,test } from '@playwright/test';

/**
 * E2E test: Verify React Context is shared across MF remotes.
 *
 * The shell provides a CounterProvider (from the `shared` remote).
 * App1 and App2 both display the counter using useCounter()
 * (shared via the MF `shared` singleton config for `@looper/shared`).
 *
 * Test uses CLIENT-SIDE navigation (link clicks) to avoid full page
 * reloads, which would reset React useState and defeat the test.
 *
 * Test flow:
 *   1. Load shell at / (full page load → counter = 0)
 *   2. Click sidebar link to /app1 → counter is 0
 *   3. Click increment → counter becomes 1
 *   4. Click sidebar link to /app2 → counter is 1 (shared state!)
 *   5. Click decrement → counter becomes 0
 *   6. Click sidebar link to /app1 → counter is 0 (shared mutation!)
 *   7. Click sidebar link to /app2 → counter is 0
 */

test.describe('React Context sharing via MF 2.0', () => {
  test('counter value is synchronized across shell, app1, and app2', async ({ page }) => {
    // ── 1. Load shell at / (one full page load) ──
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for shell to bootstrap and load shared providers
    await page.waitForTimeout(3000);

    // Locators
    const counterValue = page.locator('[data-testid="counter-value"]');

    // ── 2. Navigate to app1 (client-side via sidebar link) ──
    await page.locator('a[href="/app1"]').click();
    await page.waitForLoadState('networkidle');
    await expect(counterValue).toBeVisible({ timeout: 15_000 });
    await expect(counterValue).toHaveText('0', { timeout: 10_000 });

    // ── 3. Increment the counter → 1 ──
    await page.locator('[data-testid="counter-inc"]').click();
    await expect(counterValue).toHaveText('1');

    // ── 4. Navigate to app2 (client-side) → counter is STILL 1 ──
    await page.locator('a[href="/app2"]').click();
    await page.waitForLoadState('networkidle');
    await expect(counterValue).toBeVisible({ timeout: 10_000 });
    await expect(counterValue).toHaveText('1');

    // ── 5. Decrement → 0 ──
    await page.locator('[data-testid="counter-dec"]').click();
    await expect(counterValue).toHaveText('0');

    // ── 6. Navigate to app1 → STILL 0 ──
    await page.locator('a[href="/app1"]').click();
    await page.waitForLoadState('networkidle');
    await expect(counterValue).toBeVisible({ timeout: 10_000 });
    await expect(counterValue).toHaveText('0');

    // ── 7. Navigate to app2 → STILL 0 ──
    await page.locator('a[href="/app2"]').click();
    await page.waitForLoadState('networkidle');
    await expect(counterValue).toBeVisible({ timeout: 10_000 });
    await expect(counterValue).toHaveText('0');
  });
});
