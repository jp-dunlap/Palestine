import { expect, test } from '@playwright/test';

const foundationsHeading = 'Canaanite urban networks flourish';
const revoltHeading = 'The 1936–39 Arab Revolt';

test('timeline filters expose accessible names and focus styles', async ({ page }) => {
  await page.goto('/timeline');
  await page.waitForLoadState('networkidle');

  const resultsRegion = page.locator('#timeline-results');
  await resultsRegion.waitFor({ state: 'visible' });

  const foundationsButton = page.getByRole('button', { name: 'Filter by era Foundations' });
  await foundationsButton.waitFor({ state: 'visible' });
  await expect(foundationsButton).toHaveAttribute('aria-controls', 'timeline-results');
  await expect(foundationsButton).toHaveAttribute('aria-label', 'Filter by era Foundations');

  await foundationsButton.focus();
  await expect(foundationsButton).toBeFocused();

  const outlineWidth = await foundationsButton.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outlineWidth).not.toBe('0px');

  const earlyEvent = page.getByRole('heading', { level: 3, name: foundationsHeading });
  await expect(earlyEvent).toBeVisible();

  const modernButton = page.getByRole('button', { name: 'Filter by era Modern / Nakba → Present' });
  await modernButton.waitFor({ state: 'visible' });

  await modernButton.click();
  await expect(modernButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 3, name: revoltHeading })).toBeVisible();
  await expect(earlyEvent).not.toBeVisible();

  await expect(resultsRegion).toHaveAttribute('aria-live', 'polite');

  await foundationsButton.click();
  await expect(foundationsButton).toHaveAttribute('aria-pressed', 'true');
  await expect(earlyEvent).toBeVisible();
});
