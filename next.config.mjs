/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from external sources
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
