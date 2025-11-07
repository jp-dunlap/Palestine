import { expect, test } from '@playwright/test';

const socialTargets = [
  '/chapters/001-prologue',
  '/timeline/arab-revolt-1936-39',
  '/places/gaza',
  '/map',
];

test.describe('Open Graph & Twitter image routes', () => {
  for (const base of socialTargets) {
    for (const variant of ['opengraph-image', 'twitter-image'] as const) {
      test(`serves ${variant} for ${base}`, async ({ request }) => {
        const response = await request.get(`${base}/${variant}`);
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('image/png');
      });
    }
  }
});
