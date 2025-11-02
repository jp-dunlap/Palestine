import { expect, test } from '@playwright/test';

type SeoExpectation = {
  path: string;
  canonical: string;
  alternates: Record<string, string>;
};

const pages: SeoExpectation[] = [
  {
    path: '/',
    canonical: '/',
    alternates: { en: '/', ar: '/ar', 'x-default': '/' },
  },
  {
    path: '/ar',
    canonical: '/ar',
    alternates: { en: '/', ar: '/ar', 'x-default': '/' },
  },
  {
    path: '/timeline',
    canonical: '/timeline',
    alternates: { en: '/timeline', ar: '/ar/timeline', 'x-default': '/timeline' },
  },
  {
    path: '/ar/timeline',
    canonical: '/ar/timeline',
    alternates: { en: '/timeline', ar: '/ar/timeline', 'x-default': '/timeline' },
  },
  {
    path: '/map',
    canonical: '/map',
    alternates: { en: '/map', ar: '/ar/map', 'x-default': '/map' },
  },
  {
    path: '/ar/map',
    canonical: '/ar/map',
    alternates: { en: '/map', ar: '/ar/map', 'x-default': '/map' },
  },
  {
    path: '/chapters/001-prologue',
    canonical: '/chapters/001-prologue',
    alternates: {
      en: '/chapters/001-prologue',
      ar: '/ar/chapters/001-prologue',
      'x-default': '/chapters/001-prologue',
    },
  },
  {
    path: '/ar/chapters/001-prologue',
    canonical: '/ar/chapters/001-prologue',
    alternates: {
      en: '/chapters/001-prologue',
      ar: '/ar/chapters/001-prologue',
      'x-default': '/chapters/001-prologue',
    },
  },
];

test.describe('SEO metadata', () => {
  for (const pageConfig of pages) {
    test(`includes canonical and hreflang links for ${pageConfig.path}`, async ({ page }) => {
      await page.goto(pageConfig.path);

      const canonicalLocator = page.locator('link[rel="canonical"]');
      const expectedCanonical = new URL(pageConfig.canonical, page.url()).toString();
      await expect(canonicalLocator).toHaveAttribute('href', expectedCanonical);

      for (const [lang, href] of Object.entries(pageConfig.alternates)) {
        const alternateLocator = page.locator(
          `link[rel="alternate"][hreflang="${lang}"]`,
        );
        const expectedHref = new URL(href, page.url()).toString();
        await expect(alternateLocator).toHaveAttribute('href', expectedHref);
      }
    });
  }
});
