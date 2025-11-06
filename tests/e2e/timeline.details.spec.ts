import { expect, test } from '@playwright/test';

test('timeline detail page renders event content', async ({ page }) => {
  await page.goto('/timeline/oslo-accords-1993-1995');

  await expect(page.getByRole('heading', { level: 1, name: 'Oslo Accords' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Related timeline' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Gaza on the map' })).toBeVisible();
});

test('arabic timeline detail renders localized numerals', async ({ page }) => {
  await page.goto('/ar/timeline/oslo-accords-1993-1995');

  await expect(page.getByRole('heading', { level: 1, name: 'Oslo Accords' })).toBeVisible();
  await expect(page.getByText('١٩٩٣–١٩٩٥')).toBeVisible();
});
