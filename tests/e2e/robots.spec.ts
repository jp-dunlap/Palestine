import { expect, test } from '@playwright/test';

test.describe('robots.txt', () => {
  test('exposes crawl directives and sitemap reference', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();

    expect(body).toContain('User-agent: *');
    expect(body).toMatch(/Sitemap:\s*(https?:\/\/[^\s]+)?\/sitemap\.xml/);
  });
});
