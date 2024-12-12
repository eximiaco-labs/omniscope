/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Otimiza o build do cliente ignorando protocolos node:
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
      };
    }

    return config;
  },
  images: {
    domains: [
      'ontologia.eximia.co',
      "localhost:8098",
      "pipedrive-profile-pics-cmh-1-pipedrive-com.s3.us-east-2.amazonaws.com",
      "pipedrive-profile-pics-cmh-1-pipedrive-com.s3.us-east-2.amazonaws.com",
    ],
  },
  output: "standalone",
  reactStrictMode: false,
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