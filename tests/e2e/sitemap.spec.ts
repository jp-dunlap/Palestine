import { expect, test } from '@playwright/test';

function extractMatches(source: string, pattern: RegExp): string[] {
  return Array.from(source.match(pattern) ?? []);
}

test.describe('sitemap.xml', () => {
  test('includes required routes and excludes deprecated ones', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();

    expect(body).toMatch(/<loc>[^<]+\/map<\/loc>/);
    expect(body).toMatch(/<loc>[^<]+\/ar\/timeline<\/loc>/);
    expect(body).toMatch(/<loc>[^<]+\/learn<\/loc>/);
    expect(body).toMatch(/<loc>[^<]+\/ar\/learn<\/loc>/);

    const chapterMatches = extractMatches(body, /\/chapters\/[^<]+/g);
    expect(chapterMatches.length).toBeGreaterThan(0);

    const timelineDetailMatches = extractMatches(body, /https?:\/\/[^<]+\/timeline\/[^<]+/g);
    const hasDetail = timelineDetailMatches.some((href) => !href.endsWith('/timeline'));
    expect(hasDetail).toBeTruthy();

    expect(body).toMatch(/<loc>[^<]+\/learn\/introduction<\/loc>/);

    const legacyMapRoute = `/${'maps'}`;
    expect(body).not.toContain(legacyMapRoute);
  });
});
