import { expect, test } from '@playwright/test';

const socialTargets = [
  '/chapters/001-prologue/opengraph-image',
  '/chapters/001-prologue/twitter-image',
  '/ar/timeline/foundations-canaanite-city-states/opengraph-image',
  '/ar/timeline/foundations-canaanite-city-states/twitter-image',
];

test.describe('social image headers', () => {
  for (const target of socialTargets) {
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
