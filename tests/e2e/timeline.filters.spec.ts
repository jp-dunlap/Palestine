import { expect, test } from '@playwright/test';

test('timeline filters by era checkboxes', async ({ page }) => {
  await page.goto('/timeline');
  await page.waitForLoadState('networkidle');

  const modernButton = page.getByRole('button', { name: 'Filter by era Modern / Nakba → Present' });
  await modernButton.waitFor({ state: 'visible' });

  const foundationsHeading = page.getByRole('heading', { level: 3, name: 'Canaanite urban networks flourish' });
  await expect(foundationsHeading).toBeVisible();

  await modernButton.click();
  await expect(modernButton).toHaveAttribute('aria-pressed', 'true');

  await expect(foundationsHeading).not.toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'The 1936–39 Arab Revolt' })).toBeVisible();
});
