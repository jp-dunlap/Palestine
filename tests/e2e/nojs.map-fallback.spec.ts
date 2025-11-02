import { expect, test } from '@playwright/test';

test.describe('Map no-JS fallback', () => {
  test.use({ javaScriptEnabled: false });

  test('EN: can navigate via anchors and get focused view server-side', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByText('JavaScript is disabled.', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: /Open on map/i }).first().click();
    await expect(page).toHaveURL(/\/map\?place=/);
    await expect(page.getByText(/Focused:\s+/)).toBeVisible();
  });

  test('AR: anchors present and RTL text', async ({ page }) => {
    await page.goto('/ar/map');
    await expect(page.getByText('تم تعطيل JavaScript.', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: /فتح على الخريطة/ }).first().click();
    await expect(page).toHaveURL(/\/ar\/map\?place=/);
    await expect(page.getByText(/المركّز:/)).toBeVisible();
  });
});
