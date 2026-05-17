import type { UIMatch } from 'react-router';
import { describe, expect,it } from 'vitest';

import {
  baseFromSplatMatch,
  collectSplatBases,
  joinRemotePath,
  resolveLeafPathnameBase,
} from '../useLeafPathnameBase';

function splatMatch(pathname: string, star: string): UIMatch {
  return {
    id: 'test',
    pathname,
    params: { '*': star },
    data: undefined,
    handle: undefined,
  };
}

describe('baseFromSplatMatch', () => {
  it('strips splat remainder from pathname', () => {
    const m = splatMatch('/app2/app4/page-b', 'app4/page-b');
    expect(baseFromSplatMatch(m)).toBe('/app2');
  });

  it('returns mount prefix at splat root', () => {
    const m = splatMatch('/app2/app4', 'app4');
    expect(baseFromSplatMatch(m)).toBe('/app2');
  });

  it('returns pathname when splat is empty', () => {
    const m = splatMatch('/app2', '');
    expect(baseFromSplatMatch(m)).toBe('/app2');
  });
});

describe('collectSplatBases', () => {
  it('orders bases outer to inner for nested splats', () => {
    const matches = [
      splatMatch('/app2/app4/page-b', 'app4/page-b'),
      splatMatch('/app2/app4/page-b', 'page-b'),
    ];
    expect(collectSplatBases(matches)).toEqual(['/app2', '/app2/app4']);
  });
});

describe('resolveLeafPathnameBase', () => {
  const nestedMatches = [
    splatMatch('/app2/app4/page-b', 'app4/page-b'),
    splatMatch('/app2/app4/page-b', 'page-b'),
  ];

  it('innermost returns deepest splat mount', () => {
    expect(resolveLeafPathnameBase(nestedMatches, '/app2/app4/page-b', 'innermost')).toBe(
      '/app2/app4',
    );
  });

  it('outermost returns menu-remote mount', () => {
    expect(resolveLeafPathnameBase(nestedMatches, '/app2/app4/page-b', 'outermost')).toBe('/app2');
  });

  it('single splat: innermost and outermost agree', () => {
    const matches = [splatMatch('/app2/settings', 'settings')];
    expect(resolveLeafPathnameBase(matches, '/app2/settings', 'innermost')).toBe('/app2');
    expect(resolveLeafPathnameBase(matches, '/app2/settings', 'outermost')).toBe('/app2');
  });
});

describe('joinRemotePath', () => {
  it('joins base and segment without duplicate slashes', () => {
    expect(joinRemotePath('/app2', 'app4')).toBe('/app2/app4');
    expect(joinRemotePath('/app2/app4', 'page-b')).toBe('/app2/app4/page-b');
  });
});
