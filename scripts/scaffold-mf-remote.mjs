#!/usr/bin/env node
/**
 * Scaffold a new MF remote workspace package from templates/mf-remote-app.
 *
 * Usage:
 *   node scripts/scaffold-mf-remote.mjs <remoteName> <port> [displayName]
 *   npm run scaffold:remote -- app3 3004 "My app"
 */

import { cpSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const TEMPLATE = join(REPO_ROOT, 'templates/mf-remote-app');

const RESERVED_PORTS = new Map([
  [3000, 'shell'],
  [3002, 'app1'],
  [3003, 'app2'],
]);

function usage(msg) {
  if (msg) console.error(msg);
  console.error(
    'Usage: node scripts/scaffold-mf-remote.mjs <remoteName> <port> [displayName]\n  Example: node scripts/scaffold-mf-remote.mjs app3 3004 "Settings"',
  );
  process.exit(1);
}

function validateRemoteName(name) {
  if (!name || !/^[a-z][a-z0-9]*$/i.test(name)) {
    usage('remoteName must match /^[a-z][a-z0-9]*$/i (e.g. app3)');
  }
}

function replaceTokens(content, { remoteName, port, packageName, displayName }) {
  return content
    .replaceAll('__REMOTE_NAME__', remoteName)
    .replaceAll('__PORT__', String(port))
    .replaceAll('__PACKAGE_NAME__', packageName)
    .replaceAll('__DISPLAY_NAME__', displayName);
}

function patchConcurrentlyDev(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;

  const nMatch = script.match(/(-n\s+)([^\s]+)/);
  if (!nMatch) throw new Error('Could not parse concurrently -n in root dev script');
  const names = nMatch[2].split(',');
  if (names.includes(remoteName)) return script;
  const shellIdx = names.indexOf('shell');
  if (shellIdx === -1) throw new Error('Expected "shell" in concurrently -n list');
  names.splice(shellIdx, 0, remoteName);
  let next = script.replace(nMatch[2], names.join(','));

  const cMatch = next.match(/(-c\s+)([^\s]+)/);
  if (!cMatch) throw new Error('Could not parse concurrently -c in root dev script');
  const cols = cMatch[2].split(',');
  const extras = ['cyan', 'magenta', 'white', 'gray'];
  const insertIdx = cols.length - 1;
  const extraIdx = Math.max(0, names.length - 5);
  cols.splice(insertIdx, 0, extras[extraIdx % extras.length]);
  next = next.replace(cMatch[2], cols.join(','));

  next = next.replace(
    '"sleep 3 && npm run dev -w packages/shell"',
    `"npm run dev -w packages/${remoteName}" "sleep 3 && npm run dev -w packages/shell"`,
  );
  return next;
}

function patchConcurrentlyStart(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;

  const nMatch = script.match(/(-n\s+)([^\s]+)/);
  if (!nMatch) throw new Error('Could not parse concurrently -n in root start script');
  const names = nMatch[2].split(',');
  if (names.includes(remoteName)) return script;
  const shellIdx = names.indexOf('shell');
  if (shellIdx === -1) throw new Error('Expected "shell" in start -n list');
  names.splice(shellIdx, 0, remoteName);
  let next = script.replace(nMatch[2], names.join(','));

  const cMatch = next.match(/(-c\s+)([^\s]+)/);
  if (!cMatch) throw new Error('Could not parse concurrently -c in root start script');
  const cols = cMatch[2].split(',');
  const extras = ['cyan', 'magenta', 'white', 'gray'];
  const insertIdx = cols.length - 1;
  const extraIdx = Math.max(0, names.length - 4);
  cols.splice(insertIdx, 0, extras[extraIdx % extras.length]);
  next = next.replace(cMatch[2], cols.join(','));

  next = next.replace(
    '"npm run start -w packages/shell"',
    `"npm run start -w packages/${remoteName}" "npm run start -w packages/shell"`,
  );
  return next;
}

function patchBuildChain(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  return script.replace(
    / && NODE_ENV=production npm run build -w packages\/shell$/,
    ` && NODE_ENV=production npm run build -w packages/${remoteName} && NODE_ENV=production npm run build -w packages/shell`,
  );
}

function patchBuildApps(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  return `${script} && NODE_ENV=production npm run build -w packages/${remoteName}`;
}

function patchTypecheck(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  const needle = 'npm run typecheck -w packages/shell';
  const idx = script.lastIndexOf(needle);
  if (idx === -1) throw new Error('Could not find shell typecheck segment');
  return `${script.slice(0, idx)}npm run typecheck -w packages/${remoteName} && ${script.slice(idx)}`;
}

function patchPlaywrightTs(content, remoteName, port) {
  if (content.includes(`npm run dev -w packages/${remoteName}'`)) return content;
  const re = /\n(\s*\{ command: 'npm run dev -w packages\/shell', port: \d+)/;
  const m = content.match(re);
  if (!m) {
    throw new Error('Could not find shell webServer entry in playwright.config.ts');
  }
  const insertLine = `\n    { command: 'npm run dev -w packages/${remoteName}', port: ${port}, timeout: 20_000, reuseExistingServer: true },`;
  return content.replace(re, `${insertLine}$&`);
}

function patchRemotePortsSpec(content, remoteName, port) {
  const re = /const REMOTE_PORTS = \{([^}]*)\} as const;/;
  const m = content.match(re);
  if (!m) {
    console.warn('Skipping e2e REMOTE_PORTS: pattern not found in mf-remote-chunks.spec.ts');
    return content;
  }
  if (content.includes(`${remoteName}:`)) return content;
  const inner = m[1].trim();
  const body = inner === '' ? `${remoteName}: ${port}` : `${inner}, ${remoteName}: ${port}`;
  return content.replace(re, `const REMOTE_PORTS = { ${body} } as const;`);
}

function patchLooperServicesPorts(repoRoot, port) {
  const svcPath = join(repoRoot, 'scripts/looper-services.sh');
  if (!existsSync(svcPath)) return;
  let s = readFileSync(svcPath, 'utf8');
  const re = /^PORTS=\(([^)]*)\)/m;
  const m = s.match(re);
  if (!m) return;
  const nums = m[1].trim().split(/\s+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.includes(port)) return;
  nums.push(port);
  nums.sort((a, b) => a - b);
  writeFileSync(svcPath, s.replace(re, `PORTS=(${nums.join(' ')})`), 'utf8');
}

function titleCaseRemote(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) usage();

  const remoteName = argv[0];
  const port = Number(argv[1]);
  const displayName = argv[2]?.trim() || titleCaseRemote(remoteName);

  validateRemoteName(remoteName);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    usage('port must be an integer 1024–65535');
  }

  const reserved = RESERVED_PORTS.get(port);
  if (reserved) usage(`Port ${port} is reserved (${reserved}). Pick another port.`);

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

  const pkgJsonPath = join(dest, 'package.json');
  const rspackPath = join(dest, 'rspack.config.ts');
  const tsconfigPath = join(dest, 'tsconfig.json');
  const bootstrapPath = join(dest, 'src/bootstrap.tsx');
  const appPath = join(dest, 'src/App.tsx');
  const homePath = join(dest, 'src/pages/HomePage.tsx');
  const widgetPath = join(dest, 'src/Widget.tsx');

  const ctx = {
    remoteName,
    port,
    packageName: `@looper/${remoteName}`,
    displayName,
  };

  for (const p of [
    pkgJsonPath,
    rspackPath,
    tsconfigPath,
    bootstrapPath,
    appPath,
    homePath,
    widgetPath,
    readmePath,
  ]) {
    writeFileSync(p, replaceTokens(readFileSync(p, 'utf8'), ctx), 'utf8');
  }

  const menuPath = join(REPO_ROOT, 'packages/shell/public/mock-menu.json');
  const menu = JSON.parse(readFileSync(menuPath, 'utf8'));
  if (!menu.apps.some((a) => a.id === remoteName)) {
    menu.apps.push({
      id: remoteName,
      name: displayName,
      entry: `http://localhost:${port}/remoteEntry.js`,
      route: `/${remoteName}/*`,
      module: './App',
      icon: 'cube',
      features: [],
      permissions: ['admin', 'user'],
    });
    writeFileSync(menuPath, `${JSON.stringify(menu, null, 2)}\n`, 'utf8');
  }

  const rootPkgPath = join(REPO_ROOT, 'package.json');
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
  rootPkg.scripts.dev = patchConcurrentlyDev(rootPkg.scripts.dev, remoteName);
  rootPkg.scripts.start = patchConcurrentlyStart(rootPkg.scripts.start, remoteName);
  rootPkg.scripts.build = patchBuildChain(rootPkg.scripts.build, remoteName);
  rootPkg.scripts['build:apps'] = patchBuildApps(rootPkg.scripts['build:apps'], remoteName);
  rootPkg.scripts.typecheck = patchTypecheck(rootPkg.scripts.typecheck, remoteName);
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`, 'utf8');

  const playwrightPath = join(REPO_ROOT, 'playwright.config.ts');
  writeFileSync(
    playwrightPath,
    patchPlaywrightTs(readFileSync(playwrightPath, 'utf8'), remoteName, port),
    'utf8',
  );

  const specPath = join(REPO_ROOT, 'e2e/mf-remote-chunks.spec.ts');
  writeFileSync(
    specPath,
    patchRemotePortsSpec(readFileSync(specPath, 'utf8'), remoteName, port),
    'utf8',
  );

  patchLooperServicesPorts(REPO_ROOT, port);

  console.log(`Scaffolded MF remote "${remoteName}" at packages/${remoteName} (port ${port}).`);
  console.log('Next: npm install && npm run dev');
}

main();
