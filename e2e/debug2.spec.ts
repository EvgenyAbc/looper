import { test } from '@playwright/test';

test('debug app1 rendering', async ({ page }) => {
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  console.log('Shell loaded');

  // Navigate to app1
  await page.goto('/app1', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  console.log('Navigated to /app1, waiting...');
  await page.waitForTimeout(5000);
  console.log('HTML:', (await page.content()).substring(0, 3000));
});
