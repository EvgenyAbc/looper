import { defineConfig } from '@playwright/test';

/**
 * E2E against production static servers (`npm run prod` / `npm run prod:fresh`).
 * Slower first run (full build). Default dev config stays in playwright.config.ts.
 *
 * Run: npx playwright test --config playwright.prod.config.ts
 */
const launchFromSystem = process.env.PW_EXECUTABLE_PATH
  ? { executablePath: process.env.PW_EXECUTABLE_PATH }
  : {
      channel: (process.env.PW_CHANNEL ?? 'chrome') as
        | 'chrome'
        | 'chrome-beta'
        | 'chrome-dev'
        | 'chrome-canary'
        | 'msedge'
        | 'msedge-beta'
        | 'msedge-dev',
    };

export default defineConfig({
  testDir: './e2e',
  testMatch: [
    '**/prod-styles.spec.ts',
    '**/prod-spinner-app2-navigation.spec.ts',
    '**/prod-remote-subnav.spec.ts',
  ],
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    ...launchFromSystem,
  },
  webServer: {
    command: 'npm run prod',
    url: 'http://localhost:3000',
    timeout: 300_000,
    reuseExistingServer: true,
  },
});
