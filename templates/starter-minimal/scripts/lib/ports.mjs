/**
 * Cross-platform TCP LISTEN port helpers (Linux, macOS, Windows).
 */
import { execSync, spawnSync } from 'node:child_process';
import { platform } from 'node:os';

const isWin = platform() === 'win32';

export function getListeningPids(port) {
  if (isWin) return getListeningPidsWindows(port);
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) return [];
    return [...new Set(out.split(/\s+/).map((s) => Number(s)).filter(Number.isFinite))];
  } catch {
    return [];
  }
}

function getListeningPidsWindows(port) {
  let out;
  try {
    out = execSync('netstat -ano', { encoding: 'utf8', windowsHide: true });
  } catch {
    return [];
  }
  const pids = new Set();
  for (const line of out.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5 || parts[0] !== 'TCP') continue;
    if (parts[3] !== 'LISTENING') continue;
    const local = parts[1];
    const localPort = local.includes(':') ? Number(local.split(':').pop()) : Number(local);
    if (localPort === port) pids.add(Number(parts[4]));
  }
  return [...pids].filter(Number.isFinite);
}

export function killPids(pids, signal = 'TERM') {
  for (const pid of pids) {
    if (isWin) {
      const args =
        signal === 'KILL' ? ['/PID', String(pid), '/F', '/T'] : ['/PID', String(pid), '/T'];
      spawnSync('taskkill', args, { stdio: 'ignore', windowsHide: true });
    } else {
      try {
        process.kill(pid, signal === 'KILL' ? 'SIGKILL' : 'SIGTERM');
      } catch {
        /* already gone */
      }
    }
  }
}

export function killPortListeners(port) {
  const pids = getListeningPids(port);
  if (pids.length) {
    console.log(`  port ${port}: TERM → PID(s) ${pids.join(', ')}`);
    killPids(pids, 'TERM');
  }
}

export function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function finalizePorts(ports) {
  await sleepMs(750);
  for (const port of ports) {
    const pids = getListeningPids(port);
    if (pids.length) {
      console.log(`  port ${port}: KILL → PID(s) ${pids.join(', ')}`);
      killPids(pids, 'KILL');
    }
  }
}

export function formatPortStatus(port) {
  const pids = getListeningPids(port);
  if (pids.length === 0) return `  ${port} — free`;
  if (isWin) {
    return `  ${port} — LISTEN (PID ${pids.join(', ')})`;
  }
  try {
    const out = execSync(`lsof -iTCP:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || `  ${port} — LISTEN (PID ${pids.join(', ')})`;
  } catch {
    return `  ${port} — LISTEN (PID ${pids.join(', ')})`;
  }
}
