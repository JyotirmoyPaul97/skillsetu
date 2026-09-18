import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the preview gateway origin to fetch Next.js dev assets in dev mode.
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
