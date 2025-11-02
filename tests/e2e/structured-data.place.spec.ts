import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function readJsonLd(page: Page) {
  const locator = page.locator('script[type="application/ld+json"]');
  await expect(locator).toHaveCount(1);
  const text = await locator.first().textContent();
  return JSON.parse(text ?? '{}');
}

test.describe('Place structured data', () => {
  test('includes schema.org Place data on the English page', async ({ page }) => {
    await page.goto('/places/gaza');
    const data = await readJsonLd(page);

    expect(data['@type']).toBe('Place');
    expect(data.inLanguage).toBe('en');
    expect(data.url).toMatch(/\/places\/gaza$/);
    expect(data.geo?.['@type']).toBe('GeoCoordinates');
    expect(typeof data.geo?.latitude).toBe('number');
    expect(typeof data.geo?.longitude).toBe('number');
  });

  test('includes schema.org Place data on the Arabic page', async ({ page }) => {
    await page.goto('/ar/places/gaza');
    const data = await readJsonLd(page);

    expect(data['@type']).toBe('Place');
    expect(data.inLanguage).toBe('ar');
    expect(data.url).toMatch(/\/ar\/places\/gaza$/);
    expect(data.geo?.['@type']).toBe('GeoCoordinates');
    expect(typeof data.geo?.latitude).toBe('number');
    expect(typeof data.geo?.longitude).toBe('number');
  });
});
