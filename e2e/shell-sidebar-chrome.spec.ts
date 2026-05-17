import { expect, type Page,test } from '@playwright/test';

async function cssVarPxFromRem(page: Page, prop: string): Promise<number> {
  const raw = await page.evaluate((name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }, prop);

  if (!raw) {
    throw new Error(
      `Missing CSS var ${prop} on :root — rebuild/restart shell so @looper/shared/styles/tokens.css loads.`,
    );
  }

  if (raw.endsWith('rem')) {
    const rem = parseFloat(raw);
    const rootFs = await page.evaluate(
      () => parseFloat(getComputedStyle(document.documentElement).fontSize || '16'),
    );
    return rem * rootFs;
  }
  if (raw.endsWith('px')) return parseFloat(raw);
  throw new Error(`Unexpected CSS value for ${prop}: ${raw}`);
}

test.describe('Shell sidebar chrome (dev)', () => {
  /**
   * Asserts tokens + packages/shell/src/styles.css sidebar chrome.
   * Locators tolerate older markup (aside.sidebar / .sidebar-nav) when dev reuseExistingServer is stale.
   */
  test('sidebar uses token width, elevation, nav active state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.shell-layout')).toBeVisible({ timeout: 45_000 });
    await expect
      .poll(async () => page.locator('.shell-layout').evaluate((el) => getComputedStyle(el).display))
      .toBe('flex');

    const sidebar = page.locator('.shell-layout > aside.sidebar');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(200);

    const expectedW = await cssVarPxFromRem(page, '--sidebar-width');
    const actualW = parseFloat(await sidebar.evaluate((el) => getComputedStyle(el).width));
    expect(Math.abs(actualW - expectedW) / expectedW).toBeLessThan(0.035);

    const shadow = await sidebar.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow, 'shell tokens.css --sidebar-elev-shadow applied').not.toBe('none');

    const bg = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, 'Sidebar surface must paint').not.toBe('transparent');

    const brandHeading = page.locator('.sidebar-header h2').first();
    await expect(brandHeading).toBeVisible();
    const titleWeight = await brandHeading.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(parseInt(titleWeight, 10)).toBeGreaterThanOrEqual(600);

    const nav = page.locator('nav.sidebar-nav');
    await expect(nav).toBeVisible();
    const home = nav.locator('a[href="/"]').first();
    await expect(home).toHaveAttribute('aria-current', 'page');
    expect(await home.evaluate((el) => getComputedStyle(el).boxShadow.includes('inset'))).toBeTruthy();
    expect(parseInt(await home.evaluate((el) => getComputedStyle(el).fontWeight), 10)).toBeGreaterThanOrEqual(600);

    const marker = home.locator('.sidebar-app-marker');
    const markerW = parseFloat(await marker.evaluate((el) => getComputedStyle(el).width));
    expect(markerW).toBeGreaterThanOrEqual(26);
    expect(markerW).toBeLessThanOrEqual(34);
  });
});
