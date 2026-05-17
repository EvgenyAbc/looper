#!/usr/bin/env node
/**
 * Generate docker/csp-policy.txt and docker/csp-header.txt from mock-menu.json.
 *
 * Usage:
 *   node scripts/build-csp.mjs [path/to/mock-menu.json]
 *   CSP_ENFORCE=true node scripts/build-csp.mjs
 *   CSP_EXTRA_ORIGINS=https://cdn.jsdelivr.net node scripts/build-csp.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildCspPolicyFromFile } from './csp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const menuPath = process.argv[2] ?? join(repoRoot, 'packages/shell/public/mock-menu.json');
const extraOrigins = (process.env.CSP_EXTRA_ORIGINS ?? '')
  .split(/[\s,]+/)
  .filter(Boolean);
const enforce = process.env.CSP_ENFORCE === 'true';

const { policy, headerLine } = buildCspPolicyFromFile(menuPath, { enforce, extraOrigins });

const outDir = join(repoRoot, 'docker');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'csp-policy.txt'), `${policy}\n`, 'utf8');
writeFileSync(join(outDir, 'csp-header.txt'), `${headerLine}\n`, 'utf8');

console.log(headerLine);
