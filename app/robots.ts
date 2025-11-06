// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/admin',
          '/timeline?',
          '/ar/timeline?',
          '/map?',
          '/ar/map?',
          '/chapters/*/opengraph-image',
          '/timeline/*/opengraph-image',
          '/places/*/opengraph-image',
          '/ar/chapters/*/opengraph-image',
          '/ar/timeline/*/opengraph-image',
          '/ar/places/*/opengraph-image',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
