import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function readEventJsonLd(page: Page) {
  const locator = page.locator('script[type="application/ld+json"]');
  await expect(locator).toHaveCount(1);
  const text = await locator.first().textContent();
  return JSON.parse(text ?? '{}');
}

function expectValidLocations(locations: unknown) {
  if (!locations) return;
  const entries = (Array.isArray(locations) ? locations : [locations]).filter(Boolean) as Array<
    Record<string, unknown>
  >;
  for (const entry of entries) {
    expect(entry['@type']).toBe('Place');
    const name = entry['name'];
    const url = entry['url'];
    const hasName = typeof name === 'string' && name.length > 0;
    const hasUrl = typeof url === 'string' && url.length > 0;
    expect(hasName || hasUrl).toBe(true);
  }
}

test.describe('Event structured data', () => {
  test('includes schema.org Event data on the English timeline event', async ({ page }) => {
    await page.goto('/timeline/arab-revolt-1936-39');
    const data = await readEventJsonLd(page);

    expect(data['@type']).toBe('Event');
    expect(data.inLanguage).toBe('en');
    expect(data.url).toMatch(/\/timeline\/arab-revolt-1936-39$/);
    expect(data.startDate).toBe('1936-01-01');
    expect(data.endDate).toBe('1939-01-01');
    expectValidLocations(data.location);
  });

  test('includes schema.org Event data on the Arabic timeline event', async ({ page }) => {
    await page.goto('/ar/timeline/arab-revolt-1936-39');
    const data = await readEventJsonLd(page);

    expect(data['@type']).toBe('Event');
    expect(data.inLanguage).toBe('ar');
    expect(data.url).toMatch(/\/ar\/timeline\/arab-revolt-1936-39$/);
    expect(data.startDate).toBe('1936-01-01');
    expect(data.endDate).toBe('1939-01-01');
    expectValidLocations(data.location);
  });
});
