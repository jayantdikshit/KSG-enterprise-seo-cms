import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Admin UI resides in src/app/admin (handled by Next 13+)
  allowedDevOrigins: ['169.254.32.171', 'localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
};

export default nextConfig;

