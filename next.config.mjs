/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ============== Image Optimization ==============
  images: {
    // Allow images from your backend and common CDNs
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.ayatiworks.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images longer
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // ============== Performance ==============
  // Compress responses
  compress: true,

  // Powered-by header off for security
  poweredByHeader: false,

  // ============== Build Optimization ==============
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Bundle analyzer headers for CDN caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
