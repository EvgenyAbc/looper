#!/usr/bin/env node
/**
 * Fail fast before `npm run start` / `prod` if MF ports are still held (e.g. old rspack serve).
 */
import { execSync } from 'node:child_process';

// Порт 3030 (@ui-looper/core) управляется отдельно через scripts/start-all.sh.
const PORTS = [3000, 3002, 3003, 3004, 3005];
const busy = [];

for (const port of PORTS) {
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (out) busy.push({ port, pids: out.replace(/\n/g, ', ') });
  } catch {
    /* free */
  }
}

if (busy.length === 0) process.exit(0);

console.error('[looper] MF ports still in use (stop old rspack serve / npm run dev first):');
for (const { port, pids } of busy) {
  console.error(`  :${port} → PID(s) ${pids}`);
}
console.error('\nRun: npm run services:stop');
console.error('Or:  kill -9 $(lsof -ti tcp:3000,3002,3003,3004,3005 -sTCP:LISTEN)');
process.exit(1);
