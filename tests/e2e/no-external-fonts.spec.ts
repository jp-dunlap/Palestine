import { expect, test } from '@playwright/test';

const bannedHosts = /(fonts\.googleapis\.com|fonts\.gstatic\.com)/i;

async function collectRequests(url: string, page: import('@playwright/test').Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    requests.push(request.url());
  });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  return requests;
}

test.describe('font privacy', () => {
  test('english routes avoid Google font hosts', async ({ page }) => {
    const requests = await collectRequests('/', page);

    const violations = requests.filter((requestUrl) => bannedHosts.test(requestUrl));
    expect(violations, violations.join('\n')).toHaveLength(0);
  });

  test('arabic routes avoid Google font hosts', async ({ page }) => {
    const requests = await collectRequests('/ar', page);

    const violations = requests.filter((requestUrl) => bannedHosts.test(requestUrl));
    expect(violations, violations.join('\n')).toHaveLength(0);
  });
});
