import { expect, test } from '@playwright/test';

test('english map place buttons support keyboard activation', async ({ page }) => {
  await page.goto('/map');

  const gazaButton = page.getByRole('button', { name: 'Focus map on Gaza' });
  await gazaButton.press('Enter');
  await expect(page.getByText('Focused: gaza')).toBeVisible();
  await expect(gazaButton).toHaveAttribute('aria-pressed', 'true');

  const jaffaButton = page.getByRole('button', { name: 'Focus map on Jaffa' });
  await jaffaButton.press(' ');
  await expect(page.getByText('Focused: jaffa')).toBeVisible();
  await expect(jaffaButton).toHaveAttribute('aria-pressed', 'true');
  await expect(gazaButton).toHaveAttribute('aria-pressed', 'false');
});

test('arabic map place buttons expose pressed state for keyboard users', async ({ page }) => {
  await page.goto('/ar/map');

  const gazaButton = page.getByRole('button', { name: 'التركيز على غزة في الخريطة' });
  await gazaButton.press('Enter');
  await expect(page.getByText('المركّز: gaza')).toBeVisible();
  await expect(gazaButton).toHaveAttribute('aria-pressed', 'true');

  const jaffaButton = page.getByRole('button', { name: 'التركيز على يافا في الخريطة' });
  await jaffaButton.press(' ');
  await expect(page.getByText('المركّز: jaffa')).toBeVisible();
  await expect(jaffaButton).toHaveAttribute('aria-pressed', 'true');
  await expect(gazaButton).toHaveAttribute('aria-pressed', 'false');
});
