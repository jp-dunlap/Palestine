import { expect, test } from '@playwright/test';

test('timeline filters by era checkboxes', async ({ page }) => {
  await page.goto('/timeline');
  const foundationsHeading = page.getByRole('heading', { level: 3, name: 'Canaanite urban networks flourish' });
  await expect(foundationsHeading).toBeVisible();

  await page
    .getByRole('checkbox', { name: 'Filter by era Modern / Nakba → Present' })
    .check();

  await expect(foundationsHeading).not.toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'The 1936–39 Arab Revolt' })).toBeVisible();
});
