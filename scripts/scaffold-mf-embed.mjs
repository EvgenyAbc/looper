#!/usr/bin/env node
/**
 * Scaffold an embed MF remote (no shell menu entry; mount from a parent remote).
 *
 * Usage:
 *   node scripts/scaffold-mf-embed.mjs <remoteName> <port> [displayName]
 *   npm run scaffold:embed -- app4 3005 "App four"
 */

import { cpSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_RESERVED_PORTS,
  buildEmbedSnippet,
  patchMonorepoIntegrations,
  titleCaseRemote,
  validatePort,
  validateRemoteName,
  writeTokenizedFiles,
} from './scaffold-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const TEMPLATE = join(REPO_ROOT, 'templates/mf-embed-remote-app');

function usage(msg) {
  if (msg) console.error(msg);
  console.error(
    'Usage: node scripts/scaffold-mf-embed.mjs <remoteName> <port> [displayName]\n  Example: node scripts/scaffold-mf-embed.mjs app4 3005 "App four"',
  );
  process.exit(1);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) usage();

  const remoteName = argv[0];
  const port = Number(argv[1]);
  const displayName = argv[2]?.trim() || titleCaseRemote(remoteName);

  validateRemoteName(remoteName, usage);
  validatePort(port, DEFAULT_RESERVED_PORTS, usage, remoteName);

  const dest = join(REPO_ROOT, 'packages', remoteName);
  if (existsSync(dest)) {
    console.error(`Target already exists: ${dest}`);
    process.exit(1);
  }

  if (!existsSync(TEMPLATE)) {
    console.error(`Template missing: ${TEMPLATE}`);
    process.exit(1);
  }

  cpSync(TEMPLATE, dest, { recursive: true });

  const ctx = {
    remoteName,
    port,
    packageName: `@looper/${remoteName}`,
    displayName,
  };

  writeTokenizedFiles(
    [
      join(dest, 'package.json'),
      join(dest, 'rspack.config.ts'),
      join(dest, 'tsconfig.json'),
      join(dest, 'src/bootstrap.tsx'),
      join(dest, 'src/App.tsx'),
      join(dest, 'src/EmbedLayout.tsx'),
      join(dest, 'src/App.module.css'),
      join(dest, 'src/pages/PageA.tsx'),
      join(dest, 'src/pages/PageB.tsx'),
      join(dest, 'README.md'),
    ],
    ctx,
  );

  const embedDoc = buildEmbedSnippet(remoteName, port, displayName);
  writeFileSync(join(dest, 'EMBED.md'), embedDoc, 'utf8');

  patchMonorepoIntegrations(REPO_ROOT, remoteName, port);

  console.log(`Scaffolded embed MF remote "${remoteName}" at packages/${remoteName} (port ${port}).`);
  console.log('Not added to mock-menu.json — mount from a parent remote (see EMBED.md).');
  console.log(embedDoc);
  console.log('Next: npm install && npm run dev');
}

main();
