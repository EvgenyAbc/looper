#!/usr/bin/env node
/** Fix old projects: never use localhost:3030 for ui-looper. */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CDN = 'https://evgenyabc.github.io/ui-looper/v1.0.0/remoteEntry.js';
const menuPath = join(process.cwd(), 'packages/shell/public/mock-menu.json');

try {
  const menu = JSON.parse(readFileSync(menuPath, 'utf8'));
  let changed = false;
  for (const s of menu.system ?? []) {
    if (!s.entry || s.entry.includes('localhost') || s.entry.includes(':3030')) {
      s.entry = CDN;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(menuPath, `${JSON.stringify(menu, null, 2)}\n`);
    console.log('[looper] ui-looper → CDN (no :3030)');
  }
} catch {
  /* no menu yet */
}
