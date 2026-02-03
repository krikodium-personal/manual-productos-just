import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/directus/:path*',
        destination: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
