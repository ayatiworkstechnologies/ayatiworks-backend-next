/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from external sources
  images: {
    domains: ['localhost'],
  },
  // Allow build to complete with ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
