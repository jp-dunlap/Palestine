import { expect, test } from '@playwright/test';

test.describe('Skip link', () => {
  test('English: shows skip link and navigates to #main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeVisible();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('Arabic: shows skip link and navigates to #main', async ({ page }) => {
    await page.goto('/ar');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'تجاوز إلى المحتوى' });
    await expect(skip).toBeVisible();
    await skip.press('Enter');
    await expect(page).toHaveURL(/\/ar#main$/);
  });
});
