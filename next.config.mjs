/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  // Keep the private CMS shell reachable at /admin → static HTML
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
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
