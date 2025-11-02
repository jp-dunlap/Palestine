import { expect, test } from '@playwright/test';

test.describe('Open Graph image routes', () => {
  test('serves chapter image', async ({ request }) => {
    const response = await request.get('/chapters/001-prologue/opengraph-image');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('serves timeline event image', async ({ request }) => {
    const response = await request.get('/timeline/arab-revolt-1936-39/opengraph-image');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('serves place image', async ({ request }) => {
    const response = await request.get('/places/gaza/opengraph-image');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  });
});
