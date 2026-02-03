import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/directus/:path*',
        destination: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/:path*`,
      },
      // Keep assets separate to avoid potential body parsing issues or just direct linking
      {
        source: '/api/assets/:path*',
        destination: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/:path*`,
      }
    ];
  },
};

export default nextConfig;
