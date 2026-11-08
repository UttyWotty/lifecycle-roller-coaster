/**
 * Next.js configuration for the application.
 * It enables cached components and partial prefetching from the framework template.
 * Turbopack runs Tailwind CSS through the dedicated loader for every stylesheet, and every route gets security headers.
 */
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/securityHeaders";

/** Next.js sets NODE_ENV itself; anything other than "development" gets the strict production policy. */
const IS_DEVELOPMENT = (process.env.NODE_ENV ?? "production") === "development";
const ALL_ROUTES = "/:path*";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: ALL_ROUTES, headers: securityHeaders(IS_DEVELOPMENT) }];
  },
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
