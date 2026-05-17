declare global {
  interface Window {
    __looperDebug?: Set<string>;
  }
}

function recordLooperDebug(key: string): void {
  if (typeof window !== 'undefined') {
    if (!window.__looperDebug) window.__looperDebug = new Set();
    window.__looperDebug.add(key);
  }
}

/** Stable markers for Playwright (`[looper] …` in console + `window.__looperDebug`). */
export function looperDebug(event: string, detail: string): void {
  const key = `${event}:${detail}`;
  recordLooperDebug(key);
  const line = `[looper] ${key}`;
  if (typeof console !== 'undefined') {
    console.log(line);
  }
}

export function looperDebugShellReady(): void {
  looperDebug('shell', 'ready');
}

export function looperDebugRemoteLoaded(remoteName: string): void {
  looperDebug('remote', `${remoteName}:loaded`);
}

export function looperDebugEmbedLoaded(remoteName: string): void {
  looperDebug('embed', `${remoteName}:loaded`);
}

export function looperDebugPageReady(pageId: string): void {
  looperDebug('page', `${pageId}:ready`);
}
