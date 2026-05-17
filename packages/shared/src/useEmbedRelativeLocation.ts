import { type Location, type UIMatch,useLocation, useMatches } from 'react-router';

import { useRemoteMountBase } from './RemoteMountBaseContext';
import { useRemoteSplat } from './RemoteSplatContext';
import {
  joinRemotePath,
  type LeafPathnameScope,
  useLeafPathnameBase,
  type UseLeafPathnameBaseOptions,
} from './useLeafPathnameBase';

function hasSplatParam(params: unknown): boolean {
  if (!params || typeof params !== 'object') return false;
  const record = params as Record<string, unknown>;
  return (
    Object.prototype.hasOwnProperty.call(record, '*') ||
    Object.prototype.hasOwnProperty.call(record, 'splat')
  );
}

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

/** Splat remainders from host matches, outer → inner (for F5-safe nested Routes). */
export function collectSplatRemainders(matches: UIMatch[]): string[] {
  const remainders: string[] = [];
  for (const m of matches) {
    if (hasSplatParam(m.params)) remainders.push(splatValue(m.params));
  }
  return remainders;
}

/** Menu-remote mount prefix from shell splat (MF-safe when `useMatches` is empty on F5). */
export function menuRemoteBaseFromPath(fullPathname: string, shellSplat: string): string {
  if (!shellSplat) {
    return fullPathname.replace(/\/+$/, '') || '/';
  }
  const suffix = `/${shellSplat.replace(/^\/+/, '')}`;
  if (fullPathname.endsWith(suffix)) {
    return fullPathname.slice(0, -suffix.length) || '/';
  }
  return fullPathname.replace(/\/+$/, '') || '/';
}

function splatTailUnderBase(fullPathname: string, base: string): string {
  const prefix = base === '/' ? '' : base;
  if (!prefix || !fullPathname.startsWith(prefix)) return '';
  return fullPathname.slice(prefix.length).replace(/^\/+/, '');
}

function splatTailFromMatches(matches: UIMatch[], scope: LeafPathnameScope): string | null {
  const remainders = collectSplatRemainders(matches);
  if (remainders.length === 0) return null;
  return scope === 'outermost' ? remainders[0] : remainders[remainders.length - 1];
}

/**
 * Pathname for `<Routes location={...} />` inside a federated remote.
 *
 * React Router requires the pathname to start with the parent route's pathnameBase
 * (e.g. `/app2`, not `/`). Join mount base + splat tail so nested routes match on F5.
 */
export function resolveEmbedRoutesPathname(
  fullPathname: string,
  routeBase: string,
  splatTail: string | null,
): string {
  if (splatTail !== null) return joinRemotePath(routeBase, splatTail);
  return joinRemotePath(routeBase, splatTailUnderBase(fullPathname, routeBase));
}

/**
 * Location for `<Routes location={...} />` inside a federated remote.
 *
 * - Menu remote: shell splat + leaf mount base (`/app2` + `app4/page-b`).
 * - Embed: `RemoteMountBaseProvider` base + tail under that prefix.
 */
export function useEmbedRelativeLocation(options?: UseLeafPathnameBaseOptions): Location {
  const scope = options?.scope ?? 'innermost';
  const { pathname, search, hash, state, key } = useLocation();
  const matches = useMatches();
  const mountBase = useRemoteMountBase();
  const shellSplat = useRemoteSplat();
  const leafBase = useLeafPathnameBase(options);

  const routeBase =
    mountBase ?? (shellSplat !== null ? menuRemoteBaseFromPath(pathname, shellSplat) : leafBase);
  // Under MF, `useMatches` in an embed bundle often exposes the parent menu splat (`app4/page-b`),
  // not the tail under `mountBase` — slice the browser URL instead.
  const splatTail =
    mountBase !== null
      ? splatTailUnderBase(pathname, mountBase)
      : shellSplat !== null
        ? shellSplat
        : splatTailFromMatches(matches, scope);

  return {
    pathname: resolveEmbedRoutesPathname(pathname, routeBase, splatTail),
    search,
    hash,
    state,
    key,
  };
}
