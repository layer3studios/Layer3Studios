import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No floating "N" badge in development: it sits on top of the mobile dock.
  devIndicators: false,
  /* config options here */
};

export default nextConfig;
