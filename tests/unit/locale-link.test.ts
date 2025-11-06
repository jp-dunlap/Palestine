import { describe, expect, it } from 'vitest';

import { resolveLocaleHref, resolveLocalePath } from '@/components/LocaleLink';

describe('resolveLocalePath', () => {
  it('prefixes english routes with /en', () => {
    expect(resolveLocalePath('/', 'en')).toBe('/en');
    expect(resolveLocalePath('/timeline', 'en')).toBe('/en/timeline');
  });

  it('prefixes arabic routes with /ar', () => {
    expect(resolveLocalePath('/', 'ar')).toBe('/ar');
    expect(resolveLocalePath('/timeline', 'ar')).toBe('/ar/timeline');
  });

  it('preserves existing locale prefixes', () => {
    expect(resolveLocalePath('/ar/map', 'ar')).toBe('/ar/map');
    expect(resolveLocalePath('/en/learn', 'en')).toBe('/en/learn');
  });
});

describe('resolveLocaleHref', () => {
  it('adds locale prefix to relative string hrefs', () => {
    expect(resolveLocaleHref('/timeline', 'en')).toBe('/en/timeline');
    expect(resolveLocaleHref('/timeline', 'ar')).toBe('/ar/timeline');
  });

  it('preserves query strings and hashes for relative hrefs', () => {
    expect(resolveLocaleHref('/map?place=haifa#details', 'ar')).toBe('/ar/map?place=haifa#details');
  });

  it('leaves external URLs untouched', () => {
    const external = 'https://example.com/page';
    expect(resolveLocaleHref(external, 'en')).toBe(external);
  });

  it('handles UrlObject inputs', () => {
    const href = { pathname: '/places/haifa', query: { view: 'map' } };
    const result = resolveLocaleHref(href, 'ar');
    expect(result).toEqual({ pathname: '/ar/places/haifa', query: { view: 'map' } });
  });
});
