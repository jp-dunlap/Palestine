import { expect, test } from '@playwright/test';

test('home search surfaces timeline events', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search').fill('Arab');
  await expect(page.getByRole('link', { name: 'The 1936–39 Arab Revolt' })).toBeVisible();
});
