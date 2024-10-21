/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ontologia.eximia.co'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
