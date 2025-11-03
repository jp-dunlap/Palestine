/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
    ];
  },
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
export default nextConfig;
