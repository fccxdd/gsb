import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.236'],
  output: 'export',
  images: {
    unoptimized: true,
  },

    experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
}

export default nextConfig;