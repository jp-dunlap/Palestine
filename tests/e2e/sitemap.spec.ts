import { expect, test } from '@playwright/test';

function extractMatches(source: string, pattern: RegExp): string[] {
  return Array.from(source.match(pattern) ?? []);
}

test.describe('sitemap.xml', () => {
  test('includes required routes and excludes deprecated ones', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();

    expect(body).toMatch(/<loc>https:\/\/palestine-two\.vercel\.app\/<\/loc>/);
    expect(body).toMatch(/<loc>https:\/\/palestine-two\.vercel\.app\/timeline<\/loc>/);
    expect(body).toMatch(/<loc>https:\/\/palestine-two\.vercel\.app\/map<\/loc>/);
    expect(body).toMatch(/<loc>https:\/\/palestine-two\.vercel\.app\/learn<\/loc>/);

    const chapterMatches = extractMatches(body, /https:\/\/palestine-two\.vercel\.app\/chapters\/[\w-]+/g);
    expect(chapterMatches.length).toBeGreaterThan(0);

    const placeMatches = extractMatches(body, /https:\/\/palestine-two\.vercel\.app\/places\/[\w-]+/g);
    expect(placeMatches.length).toBeGreaterThan(0);

    expect(body).toMatch(/xhtml:link[^>]+hreflang="ar"[^>]+\/ar\/timeline/);
    expect(body).toMatch(/xhtml:link[^>]+hreflang="ar"[^>]+\/ar\/chapters\//);
    expect(body).toMatch(/xhtml:link[^>]+hreflang="ar"[^>]+\/ar\/places\//);
  });
});
