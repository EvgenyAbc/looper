import { type APIRequestContext,expect, test } from '@playwright/test';

/**
 * MF host vs remote chunks (see mf-manifest + network sanity):
 * - Remotes must not emit shared-library JS chunks (react / router / @looper/shared come from host).
 * - From each remote origin we only expect small container + expose (+ dev bootstrap/HMR if any).
 */

const REMOTE_PORTS = { app1: 3002, app2: 3003, app3: 3004, app4: 3005 } as const;

type MfManifest = {
  id: string;
  shared: Array<{
    name: string;
    assets: { js: { sync: string[]; async: string[] } };
  }>;
  exposes: Array<{
    name: string;
    assets: { js: { sync: string[]; async: string[] } };
  }>;
};

async function fetchManifest(request: APIRequestContext, port: number): Promise<MfManifest> {
  const res = await request.get(`http://localhost:${port}/mf-manifest.json`);
  expect(res.ok(), `mf-manifest.json ${port} → ${res.status()}`).toBeTruthy();
  return res.json() as Promise<MfManifest>;
}

function assertSharedHasNoJsAssets(manifest: MfManifest, label: string) {
  for (const s of manifest.shared) {
    const sync = s.assets?.js?.sync ?? [];
    const async = s.assets?.js?.async ?? [];
    expect(sync, `${label} shared "${s.name}" must not list sync JS assets`).toEqual([]);
    expect(async, `${label} shared "${s.name}" must not list async JS assets`).toEqual([]);
  }
}

test.describe('MF remote chunks (host vs remote)', () => {
  test('mf-manifest: remotes have no shared JS assets; expose lists only federation expose chunk', async ({ request }) => {
    for (const [id, port] of Object.entries(REMOTE_PORTS)) {
      const manifest = await fetchManifest(request, port);
      expect(manifest.id).toBe(id);
      assertSharedHasNoJsAssets(manifest, id);

      const exposeSync = manifest.exposes.flatMap(e => e.assets?.js?.sync ?? []);
      expect(exposeSync.length, `${id}: expected exactly one expose sync chunk`).toBeGreaterThan(0);
      for (const file of exposeSync) {
        expect(
          file.includes('__federation_expose_') || file.includes('federation_expose'),
          `${id}: unexpected expose file ${file}`,
        ).toBeTruthy();
      }
    }
  });

  test('network: app1 origin does not serve megabyte vendor chunks', async ({ page }) => {
    /** Max size (bytes) for a non-remoteEntry .js response from app1 — catches accidental react-dom-scale bundles (~177KB). */
    const MAX_NON_REMOTE_ENTRY_JS = 210_000;
    /** Dev `remoteEntry.js` includes MF dev runtime glue (~145KB); prod is ~43KB. E2E uses `npm run dev` remotes. */
    const MAX_REMOTE_ENTRY_JS = 160_000;

    const responses: { url: string; size: number; basename: string }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes(`localhost:${REMOTE_PORTS.app1}/`)) return;
      if (!url.split('?')[0].endsWith('.js')) return;
      let size = Number(response.headers()['content-length'] ?? NaN);
      if (!Number.isFinite(size)) {
        try {
          size = (await response.body()).length;
        } catch {
          return;
        }
      }
      const basename = new URL(url).pathname.split('/').pop() ?? '';
      responses.push({ url, size, basename });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.getByTestId('shell-sidebar-nav').getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForLoadState('networkidle');

    const remoteEntry = responses.filter(r => r.basename.includes('remoteEntry'));
    expect(remoteEntry.length, 'app1 should load remoteEntry.js').toBeGreaterThan(0);
    const expose = responses.filter(r => r.basename.includes('__federation_expose_'));
    expect(expose.length, 'app1 should load __federation_expose_*.js').toBeGreaterThan(0);

    for (const r of responses) {
      const isRemoteEntry = r.basename.includes('remoteEntry');
      const max = isRemoteEntry ? MAX_REMOTE_ENTRY_JS : MAX_NON_REMOTE_ENTRY_JS;
      expect(
        r.size,
        `app1 ${r.basename} is ${r.size} bytes (cap ${max}) — possible vendor leak: ${r.url}`,
      ).toBeLessThanOrEqual(max);
    }
  });
});
