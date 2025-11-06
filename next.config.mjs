/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { mdxRs: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  async headers() {
    const connectSrcHosts = [
      'ws:',
      'wss:',
      'https://tile.openstreetmap.org',
      'https://a.tile.openstreetmap.org',
      'https://b.tile.openstreetmap.org',
      'https://c.tile.openstreetmap.org',
    ];
    const socialImageCacheControl = 'public, max-age=31536000, immutable';
    const socialImageRoutes = [
      '/opengraph-image',
      '/twitter-image',
      '/ar/opengraph-image',
      '/ar/twitter-image',
      '/map/opengraph-image',
      '/map/twitter-image',
      '/ar/map/opengraph-image',
      '/ar/map/twitter-image',
      '/timeline/:id/opengraph-image',
      '/timeline/:id/twitter-image',
      '/ar/timeline/:id/opengraph-image',
      '/ar/timeline/:id/twitter-image',
      '/chapters/:slug/opengraph-image',
      '/chapters/:slug/twitter-image',
      '/ar/chapters/:slug/opengraph-image',
      '/ar/chapters/:slug/twitter-image',
      '/places/:id/opengraph-image',
      '/places/:id/twitter-image',
      '/ar/places/:id/opengraph-image',
      '/ar/places/:id/twitter-image',
      '/learn/:slug/opengraph-image',
    ];
    const socialHeaders = socialImageRoutes.map((source) => ({
      source,
      headers: [
        {
          key: 'Cache-Control',
          value: socialImageCacheControl,
        },
        {
          key: 'X-Robots-Tag',
          value: 'noindex, noimageindex',
        },
      ],
    }));
    const csp = [
      "default-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src 'self' ${connectSrcHosts.join(' ')}`,
      'upgrade-insecure-requests',
    ].join('; ');

    // Extend script-src or connect-src if future analytics or third-party tooling is introduced.

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), browsing-topics=()' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/map/style.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      ...socialHeaders,
    ];
  },

  // Keep the private CMS shell reachable at /admin → static HTML
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
      { source: '/en', destination: '/' },
      { source: '/en/:path*', destination: '/:path*' },
    ];
  },

  // Preserve legacy map URLs so old links don’t 404
  async redirects() {
    return [
      { source: '/maps', destination: '/map', permanent: true },
      { source: '/ar/maps', destination: '/ar/map', permanent: true },
    ];
  },
};

export default nextConfig;
