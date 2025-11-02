import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function readArticleJsonLd(page: Page) {
  const locator = page.locator('script[type="application/ld+json"]');
  await expect(locator).toHaveCount(1);
  const text = await locator.first().textContent();
  return JSON.parse(text ?? '{}');
}

test.describe('Article structured data', () => {
  test('includes schema.org Article data on the English chapter', async ({ page }) => {
    await page.goto('/chapters/001-prologue');
    const data = await readArticleJsonLd(page);

    expect(data['@type']).toBe('Article');
    expect(typeof data.headline).toBe('string');
    expect(data.headline?.length).toBeGreaterThan(0);
    expect(data.inLanguage).toBe('en');
    expect(data.url).toMatch(/\/chapters\/001-prologue$/);
  });

  test('includes schema.org Article data on the Arabic chapter', async ({ page }) => {
    await page.goto('/ar/chapters/001-prologue');
    const data = await readArticleJsonLd(page);

    expect(data['@type']).toBe('Article');
    expect(typeof data.headline).toBe('string');
    expect(data.headline?.length).toBeGreaterThan(0);
    expect(data.inLanguage).toBe('ar');
    expect(data.url).toMatch(/\/ar\/chapters\/001-prologue$/);
  });
});
