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
};

export default nextConfig;
