import { expect, test } from '@playwright/test';

test('map focuses on requested place and copies link', async ({ page }) => {
  const canonicalMapUrl = '/map?place=gaza';
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: () => Promise.resolve(),
      },
      configurable: true,
    });
  });

  await page.goto(canonicalMapUrl);
  await expect(page.getByText('Focused: Gaza')).toBeVisible();

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText('Link copied to clipboard')).toBeVisible();
});

test('list view supports keyboard navigation to focus places', async ({ page }) => {
  await page.goto('/map');
  await page.getByRole('button', { name: 'List view' }).click();

  const list = page.getByRole('list', { name: 'Places list' });
  await expect(list).toBeVisible();
  await expect(list).toBeFocused();

  await page.keyboard.press('Tab');
  const firstPlaceButton = list.locator('li button').first();
  await expect(firstPlaceButton).toBeFocused();

  const initialUrl = page.url();
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(initialUrl);
  await expect(page).toHaveURL(/place=/);
});

test('focus map control directs focus to the leaflet container', async ({ page }) => {
  await page.goto('/map');
  const mapContainer = page.locator('.leaflet-container').first();
  await expect(mapContainer).toBeVisible();

  await page.getByRole('button', { name: 'Focus map' }).click();
  await expect(mapContainer).toBeFocused();
});
