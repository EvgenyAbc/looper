import type { Page } from '@playwright/test';

/**
 * Chrome DevTools "Slow 3G" style limits (throughput in bytes/s, latency in ms).
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions
 */
export async function emulateSlow3G(page: Page): Promise<void> {
  const session = await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: Math.floor((780 * 1024) / 8),
    uploadThroughput: Math.floor((330 * 1024) / 8),
    latency: 562,
  });
}
