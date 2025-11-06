import { expect, test } from '@playwright/test';

test.describe('robots.txt', () => {
  test('exposes crawl directives and sitemap reference', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();

    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body).toMatch(/Allow:\s*\//i);
    expect(body).toMatch(/Disallow:\s*\/admin/i);
    expect(body).toMatch(/Disallow:\s*\/api\/admin/i);

    const disallowTargets = [
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

    for (const target of disallowTargets) {
      expect(body).toContain(`Disallow: ${target}`);
    }

    expect(body).toMatch(/Sitemap:\s*(https?:\/\/[^\s]+)?\/sitemap\.xml/i);
  });
});
