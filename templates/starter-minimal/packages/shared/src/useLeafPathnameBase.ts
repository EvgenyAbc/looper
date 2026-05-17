import { type UIMatch,useLocation, useMatches } from 'react-router';

import { useRemoteMountBase } from './RemoteMountBaseContext';

export type LeafPathnameScope = 'innermost' | 'outermost';

export interface UseLeafPathnameBaseOptions {
  scope?: LeafPathnameScope;
}

function trimTrailingSlashes(pathnameBase: string): string {
  if (pathnameBase === '/' || pathnameBase === '') return '/';
  return pathnameBase.replace(/\/+$/, '') || '/';
}

/** Prefer pathnameBase when the runtime exposes it (data router); UIMatch types omit it in RR 7+. */
function matchMountPrefix(m: UIMatch): string {
  const withBase = m as UIMatch & { pathnameBase?: string };
  return trimTrailingSlashes(withBase.pathnameBase ?? m.pathname);
}

function hasSplatParam(params: unknown): boolean {
  if (!params || typeof params !== 'object') return false;
  const record = params as Record<string, unknown>;
  return (
    Object.prototype.hasOwnProperty.call(record, '*') ||
    Object.prototype.hasOwnProperty.call(record, 'splat')
  );
}

/** Splat remainder for `path: '/appX/*'` (empty string at `/appX`). */
function splatValue(params: unknown): string {
  if (!params || typeof params !== 'object') return '';
  const record = params as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, '*')) {
    const star = record['*'];
    return typeof star === 'string' ? star : '';
  }
  if (Object.prototype.hasOwnProperty.call(record, 'splat')) {
    const sp = record['splat'];
    return typeof sp === 'string' ? sp : '';
  }
  return '';
}

/** @internal Exported for unit tests. */
export function baseFromSplatMatch(m: UIMatch): string {
  const rest = splatValue(m.params);
  const full = trimTrailingSlashes(m.pathname);
  if (rest !== '') {
    const suffix = rest.startsWith('/') ? rest : `/${rest}`;
    if (full.endsWith(suffix)) {
      const cut = full.slice(0, Math.max(0, full.length - suffix.length)) || '/';
      return trimTrailingSlashes(cut);
    }
  }
  return matchMountPrefix(m);
}

/** @internal Collect splat mount prefixes in route-tree order (outer → inner). */
export function collectSplatBases(matches: UIMatch[]): string[] {
  const bases: string[] = [];
  for (const m of matches) {
    if (hasSplatParam(m.params)) {
      const p = baseFromSplatMatch(m);
      if (p !== '/') bases.push(p);
    }
  }
  return bases;
}

function fallbackPrefix(matches: UIMatch[], pathname: string): string {
  const prefixes = matches
    .map((m) => matchMountPrefix(m))
    .filter((b) => {
      const base = trimTrailingSlashes(b);
      if (base === '/') return false;
      return pathname === base || pathname.startsWith(`${base}/`);
    })
    .map(trimTrailingSlashes);

  if (prefixes.length === 0) return '/';
  return prefixes.reduce((a, b) => (a.length <= b.length ? a : b));
}

/**
 * Pure resolver for splat mount prefixes (testable without React Router hooks).
 *
 * - `innermost` (default): current remote section, e.g. `/app2/app4` under nested splats.
 * - `outermost`: parent menu-remote mount, e.g. `/app2` when linking into an embed section.
 */
export function resolveLeafPathnameBase(
  matches: UIMatch[],
  pathname: string,
  scope: LeafPathnameScope = 'innermost',
): string {
  const splatBases = collectSplatBases(matches);

  if (splatBases.length > 0) {
    if (scope === 'outermost') return splatBases[0];
    return splatBases[splatBases.length - 1];
  }

  return fallbackPrefix(matches, pathname);
}

/** Join remote mount prefix and a segment; avoids duplicate slashes */
export function joinRemotePath(prefix: string, segment: string): string {
  const base = trimTrailingSlashes(prefix);
  const seg = segment.replace(/^\/+|\/+$/g, '');
  if (!seg) return base === '/' ? '/' : base;
  if (base === '/') return `/${seg}`;
  return `${base}/${seg}`;
}

/**
 * Pathname prefix where the MF page route is mounted under the host splat (`/appX/*`).
 *
 * Relative `NavLink to="segment"` resolves incorrectly inside that boundary (URLs can stack like
 * `/appX/settings/settings`). Build tabs with `to={joinRemotePath(useLeafPathnameBase(), 'segment')}`.
 *
 * With nested embed splats (`/app2/*` → `app4/*`), use `scope: 'outermost'` in the parent remote
 * subnav and default `innermost` inside the embed remote.
 */
export function useLeafPathnameBase(options?: UseLeafPathnameBaseOptions): string {
  const scope = options?.scope ?? 'innermost';
  const mountBase = useRemoteMountBase();
  const matches = useMatches();
  const pathname = useLocation().pathname;

  if (mountBase && scope === 'innermost') {
    return mountBase;
  }

  return resolveLeafPathnameBase(matches, pathname, scope);
}
