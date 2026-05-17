import type { UIMatch } from 'react-router';
import { describe, expect,it } from 'vitest';

import {
  collectSplatRemainders,
  menuRemoteBaseFromPath,
  resolveEmbedRoutesPathname,
} from '../useEmbedRelativeLocation';

function splatMatch(star: string): UIMatch {
  return {
    id: 'test',
    pathname: '/ignored',
    params: { '*': star },
    data: undefined,
    handle: undefined,
  };
}

describe('collectSplatRemainders', () => {
  it('orders remainders outer to inner', () => {
    const matches = [splatMatch('app4/page-b'), splatMatch('page-b')];
    expect(collectSplatRemainders(matches)).toEqual(['app4/page-b', 'page-b']);
  });

  it('outermost remainder is app4/page-b for deep embed URL', () => {
    const matches = [splatMatch('app4/page-b')];
    expect(collectSplatRemainders(matches)[0]).toBe('app4/page-b');
  });
});

describe('menuRemoteBaseFromPath', () => {
  it('derives /app2 from deep embed splat on F5', () => {
    expect(menuRemoteBaseFromPath('/app2/app4/page-b', 'app4/page-b')).toBe('/app2');
  });

  it('returns mount path at menu remote root', () => {
    expect(menuRemoteBaseFromPath('/app2', '')).toBe('/app2');
  });
});

describe('resolveEmbedRoutesPathname', () => {
  it('menu remote at /app2 uses /app2 not /', () => {
    expect(resolveEmbedRoutesPathname('/app2', '/app2', '')).toBe('/app2');
  });

  it('menu remote deep embed keeps full path under mount base', () => {
    expect(resolveEmbedRoutesPathname('/app2/app4/page-b', '/app2', 'app4/page-b')).toBe(
      '/app2/app4/page-b',
    );
  });

  it('embed remote uses mount base + inner tail', () => {
    expect(resolveEmbedRoutesPathname('/app2/app4/page-b', '/app2/app4', 'page-b')).toBe(
      '/app2/app4/page-b',
    );
  });

  it('derives tail from full pathname when splat is null', () => {
    expect(resolveEmbedRoutesPathname('/app2/app4/page-b', '/app2/app4', null)).toBe(
      '/app2/app4/page-b',
    );
  });
});
