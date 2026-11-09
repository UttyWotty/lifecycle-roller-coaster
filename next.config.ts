/**
 * Next.js configuration for the application.
 * It enables cached components and partial prefetching from the framework template.
 * Turbopack runs Tailwind CSS through the dedicated loader for every stylesheet, and app routes get security headers.
 * BotID's proxy rewrites are added last, so its challenge reaches Vercel through this site's own origin.
 */
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/securityHeaders";

/** Next.js sets NODE_ENV itself; anything other than "development" gets the strict production policy. */
const IS_DEVELOPMENT = (process.env.NODE_ENV ?? "production") === "development";
/**
 * Every route except BotID's challenge path, which withBotId serves from Vercel with its own frame header.
 * Our strict frame-ancestors would otherwise override it and could break the challenge.
 */
const APP_ROUTES = "/((?!149e9513-01fa-4fb0-aad4-566afd725d1b).*)";
/**
 * Vercel sets VERCEL to "1" while building a deployment. Baking it into the browser bundle turns on the
 * BotID client only there, because off Vercel its challenge script does not exist and requests would wait for it.
 */
const BOT_PROTECTION = (process.env.VERCEL ?? "") === "1" ? "on" : "off";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BOT_PROTECTION: BOT_PROTECTION },
  async headers() {
    return [{ source: APP_ROUTES, headers: securityHeaders(IS_DEVELOPMENT) }];
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

/** withBotId adds same-origin rewrites that carry BotID's challenge script and API to Vercel. */
export default withBotId(nextConfig);
