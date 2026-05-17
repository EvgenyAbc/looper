import { defineConfig } from '@playwright/test';

/** System browser via Playwright `channel`, or PW_EXECUTABLE_PATH for a custom Chromium/Chrome binary. */
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
  timeout: 30_000,
  retries: 1,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    actionTimeout: 10_000,
    ...launchFromSystem,
  },
  webServer: [

    { command: 'npm run dev -w packages/app1', port: 3002, timeout: 20_000, reuseExistingServer: true },
    { command: 'npm run dev -w packages/app2', port: 3003, timeout: 20_000, reuseExistingServer: true },
    { command: 'npm run dev -w packages/app3', port: 3004, timeout: 20_000, reuseExistingServer: true },
    { command: 'npm run dev -w packages/app4', port: 3005, timeout: 20_000, reuseExistingServer: true },
    { command: 'npm run dev -w packages/shell', port: 3000, timeout: 20_000, reuseExistingServer: true },
  ],
});
