import { expect, test } from '@playwright/test';

test.describe('robots.txt', () => {
  test('exposes crawl directives and sitemap reference', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();

    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body).toMatch(/Allow:\s*\//i);
    expect(body).toMatch(/Disallow:\s*\/admin/i);
    expect(body).toMatch(/Disallow:\s*\/api\/cms/i);
    expect(body).toMatch(/Disallow:\s*\/api\/auth\/*/i);

    expect(body).toMatch(/Sitemap:\s*https:\/\/palestine-two\.vercel\.app\/sitemap\.xml/i);
  });
});
