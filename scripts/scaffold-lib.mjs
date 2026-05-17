import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const DEFAULT_RESERVED_PORTS = new Map([
  [3000, 'shell'],
  [3002, 'app1'],
  [3003, 'app2'],
  [3004, 'app3'],
  [3005, 'app4'],
]);

export function titleCaseRemote(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function validateRemoteName(name, usage) {
  if (!name || !/^[a-z][a-z0-9]*$/i.test(name)) {
    usage('remoteName must match /^[a-z][a-z0-9]*$/i (e.g. app3)');
  }
}

export function validatePort(port, reservedPorts, usage, allowRemoteName) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    usage('port must be an integer 1024–65535');
  }
  const reserved = reservedPorts.get(port);
  if (reserved && reserved !== allowRemoteName) {
    usage(`Port ${port} is reserved (${reserved}). Pick another port.`);
  }
}

export function replaceTokens(content, { remoteName, port, packageName, displayName }) {
  return content
    .replaceAll('__REMOTE_NAME__', remoteName)
    .replaceAll('__PORT__', String(port))
    .replaceAll('__PACKAGE_NAME__', packageName)
    .replaceAll('__DISPLAY_NAME__', displayName);
}

export function writeTokenizedFiles(filePaths, ctx) {
  for (const p of filePaths) {
    writeFileSync(p, replaceTokens(readFileSync(p, 'utf8'), ctx), 'utf8');
  }
}

export function patchConcurrentlyDev(script, remoteName) {
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

export function patchConcurrentlyStart(script, remoteName) {
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

export function patchBuildChain(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  return script.replace(
    / && NODE_ENV=production npm run build -w packages\/shell$/,
    ` && NODE_ENV=production npm run build -w packages/${remoteName} && NODE_ENV=production npm run build -w packages/shell`,
  );
}

export function patchBuildApps(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  return `${script} && NODE_ENV=production npm run build -w packages/${remoteName}`;
}

export function patchTypecheck(script, remoteName) {
  if (script.includes(`packages/${remoteName}`)) return script;
  const needle = 'npm run typecheck -w packages/shell';
  const idx = script.lastIndexOf(needle);
  if (idx === -1) throw new Error('Could not find shell typecheck segment');
  return `${script.slice(0, idx)}npm run typecheck -w packages/${remoteName} && ${script.slice(idx)}`;
}

export function patchRootPackageJson(rootPkg, remoteName) {
  rootPkg.scripts.dev = patchConcurrentlyDev(rootPkg.scripts.dev, remoteName);
  rootPkg.scripts.start = patchConcurrentlyStart(rootPkg.scripts.start, remoteName);
  rootPkg.scripts.build = patchBuildChain(rootPkg.scripts.build, remoteName);
  rootPkg.scripts['build:apps'] = patchBuildApps(rootPkg.scripts['build:apps'], remoteName);
  rootPkg.scripts.typecheck = patchTypecheck(rootPkg.scripts.typecheck, remoteName);
  return rootPkg;
}

export function patchPlaywrightTs(content, remoteName, port) {
  if (content.includes(`npm run dev -w packages/${remoteName}'`)) return content;
  const re = /\n(\s*\{ command: 'npm run dev -w packages\/shell', port: \d+)/;
  const m = content.match(re);
  if (!m) {
    throw new Error('Could not find shell webServer entry in playwright.config.ts');
  }
  const insertLine = `\n    { command: 'npm run dev -w packages/${remoteName}', port: ${port}, timeout: 20_000, reuseExistingServer: true },`;
  return content.replace(re, `${insertLine}$&`);
}

export function patchRemotePortsSpec(content, remoteName, port) {
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

export function patchLooperServicesPorts(repoRoot, port) {
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

export function patchMonorepoIntegrations(repoRoot, remoteName, port) {
  const rootPkgPath = join(repoRoot, 'package.json');
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
  patchRootPackageJson(rootPkg, remoteName);
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`, 'utf8');

  const playwrightPath = join(repoRoot, 'playwright.config.ts');
  writeFileSync(
    playwrightPath,
    patchPlaywrightTs(readFileSync(playwrightPath, 'utf8'), remoteName, port),
    'utf8',
  );

  const specPath = join(repoRoot, 'e2e/mf-remote-chunks.spec.ts');
  writeFileSync(
    specPath,
    patchRemotePortsSpec(readFileSync(specPath, 'utf8'), remoteName, port),
    'utf8',
  );

  patchLooperServicesPorts(repoRoot, port);
}

export function buildEmbedSnippet(remoteName, port, displayName) {
  const entry = `http://localhost:${port}/remoteEntry.js`;
  return `# Mount ${remoteName} inside a parent remote

Parent must run under the shell (MF runtime-core on host). Register and load at runtime:

\`\`\`tsx
import { Route, Routes } from 'react-router';
import {
  FederatedApp,
  joinRemotePath,
  useEmbedRelativeLocation,
  useLeafPathnameBase,
  type FederatedEmbedConfig,
} from '@looper/shared';

export const ${remoteName.toUpperCase()}_REMOTE = {
  remoteName: '${remoteName}',
  entry: '${entry}',
  mountSegment: '${remoteName}',
  modulePath: './App',
  loadingLabel: '${displayName}',
} as const satisfies FederatedEmbedConfig;

// Parent App:
const relativeLocation = useEmbedRelativeLocation({ scope: 'outermost' });
<Routes location={relativeLocation}>
  <Route
    path={\`\${${remoteName.toUpperCase()}_REMOTE.mountSegment}/*\`}
    element={<FederatedApp config={${remoteName.toUpperCase()}_REMOTE} />}
  />
</Routes>

<NavLink to={joinRemotePath(useLeafPathnameBase({ scope: 'outermost' }), ${remoteName.toUpperCase()}_REMOTE.mountSegment)}>
  ${displayName}
</NavLink>
\`\`\`

Embed remote App.tsx: \`useEmbedRelativeLocation()\` + \`<Routes location={...}>\`.

URLs when parent is at \`/app2/*\`: \`/app2/${remoteName}\`, \`/app2/${remoteName}/page-b\`.
`;
}
