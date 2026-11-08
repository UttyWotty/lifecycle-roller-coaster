/**
 * Pure list of the HTTP security headers sent with every page and API response.
 * The content security policy allows only this site's own scripts, styles, images and requests, and no framing.
 * Development adds the eval and websocket allowances the dev server's hot reload needs, and nothing else.
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

/** Next.js inlines small bootstrap scripts and styles, so inline code from this origin must stay allowed. */
const PRODUCTION_DIRECTIVES: Readonly<Record<string, readonly string[]>> = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  /** Image export draws the ride from a data URL and hands back a blob. */
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

const DEVELOPMENT_EXTRAS: Readonly<Record<string, readonly string[]>> = {
  "script-src": ["'unsafe-eval'"],
  "connect-src": ["ws:"],
};

export function contentSecurityPolicy(isDevelopment: boolean): string {
  return Object.entries(PRODUCTION_DIRECTIVES)
    .map(([name, sources]) => {
      const extras = isDevelopment ? (DEVELOPMENT_EXTRAS[name] ?? []) : [];
      return `${name} ${[...sources, ...extras].join(" ")}`;
    })
    .join("; ");
}

export function securityHeaders(isDevelopment: boolean): SecurityHeader[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDevelopment) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}
