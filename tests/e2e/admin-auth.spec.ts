import { expect, test } from '@playwright/test';

test.describe('admin access control', () => {
  test('rejects unauthenticated visitors', async ({ request }) => {
    const response = await request.get('/admin');
    expect(response.status()).toBe(401);
  });

  test('allows authenticated access to the CMS shell', async ({ browser }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    const context = await browser.newContext({
      baseURL,
      httpCredentials: {
        username: 'test',
        password: 'secret',
      },
    });

    const page = await context.newPage();
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200);

    await expect(page.locator('#cms-status h1')).toHaveText(/Palestine CMS/i);
    await expect(page.locator('#cms-status-message')).toContainText('Loading secure editor');

    await context.close();
  });
});
