import { expect, test } from '@playwright/test';

test('Arabic home links back to English', async ({ page }) => {
  await page.goto('/ar');
  await page.getByRole('link', { name: 'عرض هذا الموقع بالإنجليزية →' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Palestine' })).toBeVisible();
});

test('Arabic map preserves place query when switching to English', async ({ page }) => {
  await page.goto('/ar/map?place=ramla');
  await page.getByTestId('language-toggle-en').click();
  await expect(page).toHaveURL(/\/map\?place=ramla$/);
  await expect(
    page.locator('span.text-sm.text-gray-600', { hasText: 'Focused: Ramla' })
  ).toBeVisible();
});

test('English map keeps focus when switching to Arabic', async ({ page }) => {
  await page.goto('/map?place=haifa');
  await page.getByTestId('language-toggle-ar').click();
  await expect(page).toHaveURL(/\/ar\/map\?place=haifa$/);
  await expect(
    page.locator('span.text-sm.text-gray-600', { hasText: 'المركّز: حيفا' })
  ).toBeVisible();
});

test('Timeline queries persist across language toggle', async ({ page }) => {
  await page.goto('/ar/timeline?q=ICJ&eras=modern');
  await page.getByTestId('language-toggle-en').click();
  await expect(page).toHaveURL(/\/timeline\?q=ICJ&eras=modern$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Timeline' })).toBeVisible();
});

test('Chapter language link routes to Arabic version', async ({ page }) => {
  await page.goto('/chapters/001-prologue');
  await page.getByRole('link', { name: 'View this chapter in Arabic →' }).click();
  await expect(page).toHaveURL('/ar/chapters/001-prologue');
});
