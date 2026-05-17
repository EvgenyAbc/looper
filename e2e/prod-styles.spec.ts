import { expect, type Page,test } from '@playwright/test';

async function cssVar(page: Page, name: string): Promise<string> {
  const v = await page.evaluate((n: string) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(n);
    return raw.trim();
  }, name);
  return v;
}

async function rootFontPx(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize || '16'));
}

test.describe('production build: themed UI from shared tokens', () => {
  test('shell and app1 remote receive CSS variables and styled surfaces', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const radius = await cssVar(page, '--radius');
    expect(radius, 'tokens.css must load on host document').toBeTruthy();
    expect(parseFloat(radius)).toBeCloseTo(0.5, 5);

    const accent = await cssVar(page, '--accent');
    expect(accent.length, '--accent should resolve').toBeGreaterThan(0);

    await page.goto('/app1', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('app1-remote-root')).toBeVisible({ timeout: 30_000 });

    const card = page.getByTestId('app1-themed-card');
    await expect(card).toBeVisible();
    const br = await card.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(br === '8px' || br === '0.5rem', `card border-radius was ${br}`).toBeTruthy();

    const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow, 'primitive card shadow').not.toBe('none');

    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  });

  test('shell sidebar loads sidebar tokens and shell-only elevation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const sw = await cssVar(page, '--sidebar-width');
    expect(sw).toMatch(/\d+(?:\.\d+)?rem/);

    const elev = await cssVar(page, '--sidebar-elev-shadow');
    expect(elev.length).toBeGreaterThan(5);

    const layout = page.locator('.shell-layout');
    await expect(layout).toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => layout.evaluate((el) => getComputedStyle(el).display)).toBe('flex');
    await expect
      .poll(async () => layout.evaluate((el) => getComputedStyle(el).flexDirection))
      .toBe('row');

    const sidebar = page.locator('.shell-layout > aside.sidebar');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    const rootPx = await rootFontPx(page);
    const expectedSidebarPx = parseFloat(sw) * rootPx;
    const actualSidebarPx = parseFloat(await sidebar.evaluate((el) => getComputedStyle(el).width));
    expect(
      Math.abs(actualSidebarPx - expectedSidebarPx) / expectedSidebarPx,
      `sidebar width (${actualSidebarPx}px) should track --sidebar-width (${sw} → ${expectedSidebarPx}px)`,
    ).toBeLessThan(0.035);

    const borderRight = parseFloat(await sidebar.evaluate((el) => getComputedStyle(el).borderRightWidth));
    expect(borderRight, 'shell styles.css draws a right edge on the aside').toBeGreaterThan(0);

    const boxShadow = await sidebar.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(boxShadow, 'Perceptible sidebar depth from tokens --sidebar-elev-shadow').not.toBe('none');

    const home = page.locator('nav.sidebar-nav').locator('a[href="/"]').first();
    await expect(home).toHaveAttribute('aria-current', 'page');
    expect(await home.evaluate((el) => getComputedStyle(el).boxShadow.includes('inset'))).toBeTruthy();
  });

  test('home widget exposes app3 MF styles independent of shell-only classes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('app3-widget-root')).toBeVisible({ timeout: 30_000 });

    const title = page.getByTestId('app3-widget-root').locator('span').first();
    const fg = await title.evaluate((el) => getComputedStyle(el).color);
    expect(
      /^(rgb|oklch|lab|lch|hsl)\(/i.test(fg) || fg === 'CanvasText',
      `title color computed as ${fg}`,
    ).toBeTruthy();
  });
});
