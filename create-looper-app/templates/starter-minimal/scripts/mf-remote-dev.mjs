#!/usr/bin/env node
/**
 * MF remote dev: disk build + static serve + watch (avoids rspack serve shared bugs).
 */
import { spawn, spawnSync } from 'node:child_process';

const port = process.argv[2];
if (!port) {
  console.error('usage: node scripts/mf-remote-dev.mjs <port>');
  process.exit(1);
}

const shell = process.platform === 'win32';
process.env.NODE_ENV = 'development';

const build = spawnSync('npx', ['rspack', 'build'], { stdio: 'inherit', shell });
if (build.status !== 0) process.exit(build.status ?? 1);

const child = spawn(
  'npx',
  [
    'concurrently',
    '-k',
    '-n',
    'watch,serve',
    '-c',
    'cyan,magenta',
    'npx rspack build --watch',
    `npx serve dist -l ${port} -C --no-port-switching`,
  ],
  { stdio: 'inherit', shell },
);

child.on('exit', (code) => process.exit(code ?? 0));
