import { expect, test } from '@playwright/test';

test.describe('localized not-found pages', () => {
  test('renders english 404 with navigation links', async ({ page }) => {
    const response = await page.goto('/def-not-a-real-route');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'View the timeline' })).toHaveAttribute('href', '/timeline');
  });

  test('renders arabic 404 with rtl layout and home link', async ({ page }) => {
    const response = await page.goto('/ar/ليس-حقيقيًا');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeVisible();
    await expect(page.locator('main#main')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', { name: 'العودة إلى الرئيسية' })).toHaveAttribute('href', '/ar');
    await expect(page.getByRole('link', { name: 'استكشاف الخط الزمني' })).toHaveAttribute('href', '/ar/timeline');
  });
});
