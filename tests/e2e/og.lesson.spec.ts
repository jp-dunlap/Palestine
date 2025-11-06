import { expect, test } from '@playwright/test';

test.describe('Lesson Open Graph image route', () => {
  test('serves OG image for introduction lesson', async ({ request }) => {
    const response = await request.get('/learn/introduction/opengraph-image');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  });
});
