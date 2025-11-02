import { describe, expect, it } from 'vitest';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

describe('buildLanguageToggleHref', () => {
  it('removes arabic prefix when targeting english', () => {
    expect(buildLanguageToggleHref('/ar/map', undefined, 'en')).toBe('/map');
    expect(buildLanguageToggleHref('/ar', undefined, 'en')).toBe('/');
  });

  it('adds arabic prefix when targeting arabic', () => {
    expect(buildLanguageToggleHref('/map', undefined, 'ar')).toBe('/ar/map');
    expect(buildLanguageToggleHref('/', undefined, 'ar')).toBe('/ar');
  });

  it('preserves query parameters regardless of order', () => {
    const query = new URLSearchParams({ place: 'haifa', era: 'modern' });
    expect(buildLanguageToggleHref('/map', query, 'ar')).toBe('/ar/map?place=haifa&era=modern');
    expect(buildLanguageToggleHref('/ar/map', query, 'en')).toBe('/map?place=haifa&era=modern');
  });

  it('handles plain query strings', () => {
    expect(buildLanguageToggleHref('/timeline', '?q=ICJ&eras=modern', 'ar')).toBe('/ar/timeline?q=ICJ&eras=modern');
  });

  it('preserves repeated query keys from strings', () => {
    expect(buildLanguageToggleHref('/timeline', '?eras=modern&eras=nakba', 'ar')).toBe(
      '/ar/timeline?eras=modern&eras=nakba'
    );
  });

  it('normalises full URLs and preserves query parameters', () => {
    expect(
      buildLanguageToggleHref('https://example.com/ar/map?place=haifa', undefined, 'en')
    ).toBe('/map?place=haifa');

    expect(
      buildLanguageToggleHref('https://example.com/map?place=haifa', undefined, 'ar')
    ).toBe('/ar/map?place=haifa');
  });

  it('handles array-based query input', () => {
    const tupleQuery: Array<[string, string]> = [
      ['place', 'ramla'],
      ['eras', 'modern'],
    ];
    expect(buildLanguageToggleHref('/map', tupleQuery, 'ar')).toBe('/ar/map?place=ramla&eras=modern');
  });

  it('preserves repeated query keys from URLSearchParams', () => {
    const params = new URLSearchParams();
    params.append('eras', 'modern');
    params.append('eras', 'nakba');
    expect(buildLanguageToggleHref('/ar/timeline', params, 'en')).toBe('/timeline?eras=modern&eras=nakba');
  });

  it('ignores undefined values in object queries', () => {
    expect(
      buildLanguageToggleHref('/timeline', { q: 'ICJ', eras: undefined, include: ['modern', 'nakba'] }, 'en')
    ).toBe('/timeline?q=ICJ&include=modern&include=nakba');
  });
});
