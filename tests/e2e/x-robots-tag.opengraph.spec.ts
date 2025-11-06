import { expect, test } from '@playwright/test';

const ogTargets = [
  '/chapters/001-prologue/opengraph-image',
  '/ar/timeline/foundations-canaanite-city-states/opengraph-image',
];

test.describe('open graph image headers', () => {
  for (const target of ogTargets) {
    test(`applies noindex directives for ${target}`, async ({ request }) => {
      const response = await request.get(target);
      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers['x-robots-tag']).toBe('noindex, noimageindex');

      const cacheControl = headers['cache-control'];
      expect(cacheControl).toBeTruthy();
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=31536000');
      expect(cacheControl).toContain('immutable');
    });
  }
});
