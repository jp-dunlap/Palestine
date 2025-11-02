import { expect, test } from '@playwright/test';

test('unknown routes show 404 page', async ({ page }) => {
  await page.goto('/not-a-real-route');
  await expect(page.getByText('404 — This page could not be found.')).toBeVisible();
});
