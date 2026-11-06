/**
 * Next.js configuration for the application.
 * It enables cached components and partial prefetching from the framework template.
 * Turbopack runs Tailwind CSS through the dedicated loader for every stylesheet.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
