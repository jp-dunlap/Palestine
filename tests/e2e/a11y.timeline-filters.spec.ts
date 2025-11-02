import { expect, test } from '@playwright/test';

const foundationsHeading = 'Canaanite urban networks flourish';
const revoltHeading = 'The 1936–39 Arab Revolt';

test('timeline filters expose accessible names and focus styles', async ({ page }) => {
  await page.goto('/timeline');

  const resultsRegion = page.locator('#timeline-results');
  await expect(resultsRegion).toBeVisible();

  const foundationsCheckbox = page.getByLabel('Filter by era Foundations');
  const modernCheckbox = page.getByLabel('Filter by era Modern / Nakba → Present');

  await expect(foundationsCheckbox).toBeVisible();
  await expect(modernCheckbox).toBeVisible();

  const foundationsLabel = page.locator('label[for="timeline-filter-foundations"]');
  await expect(foundationsLabel).toHaveAttribute('aria-controls', 'timeline-results');
  await expect(foundationsLabel).toHaveAttribute('aria-label', 'Filter by era Foundations');

  await foundationsCheckbox.focus();
  await expect(foundationsCheckbox).toBeFocused();

  const focusShadow = await foundationsLabel.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(focusShadow).not.toBe('none');
  expect(focusShadow).not.toBe('rgba(0, 0, 0, 0) 0px 0px 0px 0px');

  const earlyEvent = page.getByRole('heading', { level: 3, name: foundationsHeading });
  await expect(earlyEvent).toBeVisible();

  await modernCheckbox.check();
  const modernLabel = page.locator('label[for="timeline-filter-modern"]');
  await expect(modernLabel).toHaveAttribute('aria-pressed', 'true');
  await expect(modernLabel).toHaveAttribute(
    'aria-label',
    'Filter by era Modern / Nakba → Present'
  );
  await expect(page.getByRole('heading', { level: 3, name: revoltHeading })).toBeVisible();
  await expect(earlyEvent).not.toBeVisible();

  await expect(resultsRegion).toHaveAttribute('aria-live', 'polite');

  await foundationsCheckbox.check();
  await expect(foundationsLabel).toHaveAttribute('aria-pressed', 'true');
  await expect(earlyEvent).toBeVisible();
});
