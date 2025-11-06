import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

describe('robots.txt configuration', () => {
  it('disallows admin surfaces and omits legacy cms api', () => {
    const result = robots();
    const rules = Array.isArray(result.rules)
      ? result.rules
      : result.rules
        ? [result.rules]
        : [];
    const disallowEntries = rules
      .map((rule: { disallow?: string | string[] }) =>
        Array.isArray(rule.disallow)
          ? rule.disallow
          : rule.disallow
            ? [rule.disallow]
            : []
      )
      .flat();

    expect(disallowEntries).toContain('/admin');
    expect(disallowEntries).toContain('/api/admin');
    expect(disallowEntries).not.toContain('/api/cms');
  });

  it('blocks index bloat for filtered pages and open graph assets', () => {
    const result = robots();
    const rules = Array.isArray(result.rules)
      ? result.rules
      : result.rules
        ? [result.rules]
        : [];
    const disallowEntries = new Set(
      rules
        .map((rule: { disallow?: string | string[] }) =>
          Array.isArray(rule.disallow)
            ? rule.disallow
            : rule.disallow
              ? [rule.disallow]
              : []
        )
        .flat()
    );

    const expectedDisallows = [
      '/timeline?',
      '/ar/timeline?',
      '/map?',
      '/ar/map?',
      '/chapters/*/opengraph-image',
      '/timeline/*/opengraph-image',
      '/places/*/opengraph-image',
      '/ar/chapters/*/opengraph-image',
      '/ar/timeline/*/opengraph-image',
      '/ar/places/*/opengraph-image',
    ];

    for (const path of expectedDisallows) {
      expect(disallowEntries.has(path)).toBe(true);
    }
  });
});
