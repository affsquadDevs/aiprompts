import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cover images are arbitrary HTTPS URLs configured in admin; allow the
    // image hosts used by the seed/demo content.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
};

export default nextConfig;
