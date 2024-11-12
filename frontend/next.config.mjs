/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ontologia.eximia.co', "localhost:8098", "pipedrive-profile-pics-cmh-1-pipedrive-com.s3.us-east-2.amazonaws.com"],
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
  webpack: (config, { isServer }) => {
    // Optimize the client build by ignoring node: protocols
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
      };
    }
    return config;
  },
};

export default nextConfig;
