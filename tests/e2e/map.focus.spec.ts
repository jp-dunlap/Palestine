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

  await page.getByRole('button', { name: 'Copy a shareable link to this view' }).click();
  await expect(page.getByText('Link copied')).toBeVisible();
});

test('open on map button focuses immediately', async ({ page }) => {
  await page.goto('/map');
  const jaffaButton = page.getByRole('button', { name: 'Open map focused on Jaffa' });
  await jaffaButton.click();
  await expect(page).toHaveURL(/\/map\?place=jaffa/);
  await expect(page.getByText('Focused: Jaffa')).toBeVisible();
});
