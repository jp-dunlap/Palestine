import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function readLessonJsonLd(page: Page) {
  const locator = page.locator('script[type="application/ld+json"]');
  await expect(locator).toHaveCount(1);
  const text = await locator.first().textContent();
  return JSON.parse(text ?? '{}');
}

test.describe('Lesson structured data', () => {
  test('renders LearningResource schema on introduction lesson', async ({ page }) => {
    await page.goto('/learn/introduction');
    const data = await readLessonJsonLd(page);

    expect(data['@type']).toBe('LearningResource');
    expect(data.inLanguage).toBe('en');
    expect(data.url).toMatch(/\/learn\/introduction$/);
    expect(data.dateModified).toBe('2024-05-01T00:00:00.000Z');
  });
});
