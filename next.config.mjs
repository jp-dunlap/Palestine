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
      {
        source: '/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/chapters/:slug/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/ar/chapters/:slug/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/places/:id/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/ar/places/:id/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/timeline/:id/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/ar/timeline/:id/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // Keep the private CMS shell reachable at /admin → static HTML
  async rewrites() {
    return [{ source: '/admin', destination: '/admin/index.html' }];
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
