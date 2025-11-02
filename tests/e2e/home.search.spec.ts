import { expect, test } from '@playwright/test';

test('home search surfaces timeline events', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search').fill('Arab');
  await expect(page.getByRole('link', { name: 'The 1936–39 Arab Revolt' })).toBeVisible();
});

test('search index loads without MiniSearch id errors', async ({ page }) => {
  const miniSearchErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('MiniSearch: document does not have ID field')) {
      miniSearchErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    if (err.message.includes('MiniSearch: document does not have ID field')) {
      miniSearchErrors.push(err.message);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Search').fill('history');
  await expect(page.getByRole('listitem').first()).toBeVisible();

  expect(miniSearchErrors).toHaveLength(0);
});

test('home search surfaces places with direct navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search').fill('Haifa');
  const placeLink = page.getByRole('link', { name: /Haifa/ }).first();
  await expect(placeLink).toBeVisible();
  await placeLink.click();
  await expect(page).toHaveURL('/places/haifa');
});
