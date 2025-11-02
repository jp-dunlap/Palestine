import { expect, test } from '@playwright/test';

test('Arabic home links back to English', async ({ page }) => {
  await page.goto('/ar');
  await page.getByRole('link', { name: 'عرض هذا الموقع بالإنجليزية →' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Palestine' })).toBeVisible();
});
