import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.zenfs.com', // Yahoo News Images
      },
      {
        protocol: 'https',
        hostname: 's.yimg.com',      // Yahoo Finance Thumbnails
      },
      {
        protocol: 'https',
        hostname: 'finance.yahoo.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
  serverExternalPackages: ['yahoo-finance2'],
};

export default nextConfig;