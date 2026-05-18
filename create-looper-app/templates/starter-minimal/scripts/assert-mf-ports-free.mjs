#!/usr/bin/env node
/**
 * Fail fast before `npm run start` / `prod` if MF ports are still held.
 */
import { getListeningPids } from './lib/ports.mjs';

const PORTS = [3000, 3002];
const busy = [];

for (const port of PORTS) {
  const pids = getListeningPids(port);
  if (pids.length) busy.push({ port, pids: pids.join(', ') });
}

if (busy.length === 0) process.exit(0);

console.error('[looper] MF ports still in use (stop old dev servers first):');
for (const { port, pids } of busy) {
  console.error(`  :${port} → PID(s) ${pids}`);
}
console.error('\nRun: npm run services:stop');
process.exit(1);
