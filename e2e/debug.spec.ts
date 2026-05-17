import { test } from '@playwright/test';

test('debug shell rendering', async ({ page }) => {
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  console.log('Page loaded, waiting 5s for async startup...');
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('HTML:', await page.content().then(h => h.substring(0, 2000)));
});
