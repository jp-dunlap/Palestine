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
};

export default withMDX(nextConfig);
