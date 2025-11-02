import { expect, test } from '@playwright/test';

test('timeline filters by era checkboxes', async ({ page }) => {
  await page.goto('/timeline');
  await page.waitForLoadState('networkidle');

  const modernLabel = page.locator('label[for="timeline-filter-modern"]');
  await modernLabel.waitFor({ state: 'visible' });

  const foundationsHeading = page.getByRole('heading', { level: 3, name: 'Canaanite urban networks flourish' });
  await expect(foundationsHeading).toBeVisible();

  await modernLabel.click();
  await expect(modernLabel).toHaveAttribute('aria-pressed', 'true');

  await expect(foundationsHeading).not.toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'The 1936–39 Arab Revolt' })).toBeVisible();
});
