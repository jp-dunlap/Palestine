import { expect, test } from '@playwright/test';

const parseBaseURL = (value?: string) => {
  try {
    return value ? new URL(value) : null;
  } catch {
    return null;
  }
};

test.describe('admin ui gating', () => {
  test('hides controls and prompts sign-in when unauthenticated in OAuth mode', async ({ context, page }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    const parsedBaseURL = parseBaseURL(baseURL);

    if (parsedBaseURL) {
      await context.addCookies([
        {
          name: 'cms_session',
          value: 'invalid',
          url: parsedBaseURL.origin,
          path: '/',
        },
      ]);
    }

    await page.goto('/admin');

    await expect(page.getByRole('link', { name: 'Sign in with GitHub' })).toBeVisible();
    await expect(page.getByText('Sign in required')).toBeVisible();
    await expect(page.locator('[data-testid="new-button"]')).toHaveCount(0);
  });
});
