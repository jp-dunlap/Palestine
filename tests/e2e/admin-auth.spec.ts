import { expect, test } from '@playwright/test';

test.describe('admin access control', () => {
  test('returns 404 for unauthenticated /admin', async ({ request }) => {
    const response = await request.get('/admin');
    expect(response.status()).toBe(404);
  });

  test('returns 401 for unauthenticated CMS API with WWW-Authenticate header', async ({ request }) => {
    const response = await request.get('/api/cms/config');
    expect(response.status()).toBe(401);
    expect(response.headers()['www-authenticate']).toContain('Basic');
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

    const apiResponse = await context.request.get('/api/cms/config');
    expect(apiResponse.status()).toBe(200);

    await context.close();
  });
});
