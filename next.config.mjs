/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async redirects() {
    return [
      {
        source: '/maps',
        destination: '/map',
        permanent: true,
      },
      {
        source: '/ar/maps',
        destination: '/ar/map',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
