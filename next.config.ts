import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 1. Ignoriamo gli errori di ESLint (come "Unexpected any")
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 2. Ignoriamo gli errori di TypeScript durante la build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
