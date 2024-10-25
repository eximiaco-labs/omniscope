/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ontologia.eximia.co', "localhost:8098"],
  },
  output: "standalone",
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
