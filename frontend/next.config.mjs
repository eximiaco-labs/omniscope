/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ontologia.eximia.co', "localhost:8098"],
  },
  output: "standalone"
};

export default nextConfig;
