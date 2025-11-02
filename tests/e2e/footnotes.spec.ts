import { expect, test } from '@playwright/test';

test('chapter footnotes link to sources section and return to text', async ({ page }) => {
  await page.goto('/chapters/001-prologue');
  const footnoteLink = page.getByRole('link', { name: 'Footnote 1' });
  await footnoteLink.click();
  await expect(page).toHaveURL(/#footnote-1$/);
  const footnotesSection = page.locator('#footnotes');
  await expect(footnotesSection).toBeVisible();
  await page.getByRole('link', { name: 'Back to text' }).click();
  await expect(page).toHaveURL(/#footnote-ref-1$/);
});
