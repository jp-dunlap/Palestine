import { expect, test } from '@playwright/test';

test('map focuses on requested place and copies link', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: () => Promise.resolve(),
      },
      configurable: true,
    });
  });

  await page.goto('/map?place=gaza');
  await expect(page.getByText('Focused: gaza')).toBeVisible();

  await page.getByRole('button', { name: 'Copy a shareable link to this view' }).click();
  await expect(page.getByText('Link copied')).toBeVisible();
});
