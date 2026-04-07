/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs/index.html',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
