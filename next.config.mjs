// next.config.mjs
import createMDX from '@next/mdx';

/** Enable MDX so we can import .mdx if/when we need it later.
 * We still primarily load MDX from /content via loaders.
 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async redirects() {
    return [
      { source: '/maps', destination: '/map', permanent: true },
      { source: '/ar/maps', destination: '/ar/map', permanent: true },
    ];
  },
};

export default withMDX(nextConfig);
