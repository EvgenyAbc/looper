#!/usr/bin/env node
/**
 * Stop MF listeners and run npm scripts — Linux, macOS, Windows.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { finalizePorts, formatPortStatus, killPortListeners } from './lib/ports.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTS = [3000, 3002];

const npmShell = process.platform === 'win32';

function usage() {
  console.log(`Usage: node scripts/looper-services.mjs <stop|status|dev|start|prod>`);
}

async function cmdStop() {
  console.log(`Stopping listeners on ports: ${PORTS.join(' ')}`);
  for (const port of PORTS) killPortListeners(port);
  await finalizePorts(PORTS);
  console.log('Done.');
}

function cmdStatus() {
  console.log('MF ports (LISTEN):');
  for (const port of PORTS) console.log(formatPortStatus(port));
}

function runNpm(script) {
  const r = spawnSync('npm', ['run', script], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: npmShell,
  });
  process.exit(r.status ?? 1);
}

async function main() {
  const sub = process.argv[2];
  switch (sub) {
    case 'stop':
      await cmdStop();
      break;
    case 'status':
      cmdStatus();
      break;
    case 'dev':
      await cmdStop();
      console.log('Starting: npm run dev');
      runNpm('dev');
      break;
    case 'start':
      await cmdStop();
      console.log('Starting: npm run start');
      runNpm('start');
      break;
    case 'prod':
      await cmdStop();
      console.log('Build + start: npm run build && npm run start');
      spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: npmShell });
      runNpm('start');
      break;
    default:
      usage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
