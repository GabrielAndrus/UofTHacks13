import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Use webpack explicitly (Turbopack doesn't support all webpack features yet)
  webpack: (config) => {
    // Handle Three.js and related libraries
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ignore canvas and other Node.js modules in client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
