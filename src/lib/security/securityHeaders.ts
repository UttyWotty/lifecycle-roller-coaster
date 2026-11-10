/**
 * Pure list of the HTTP security headers sent with every page and API response.
 * The content security policy allows only this site's own scripts, styles, images and requests, and no framing,
 * except on the embed page, which any site may frame and which has nothing to click-jack.
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

/** Who may show a page inside a frame: nobody, or any site for the embed page. */
export type Framing = "deny" | "anyone";

const FRAME_ANCESTORS = "frame-ancestors";
const ANY_SITE = "*";

export function contentSecurityPolicy(isDevelopment: boolean, framing: Framing): string {
  return Object.entries(PRODUCTION_DIRECTIVES)
    .map(([name, sources]) => {
      const extras = isDevelopment ? (DEVELOPMENT_EXTRAS[name] ?? []) : [];
      const allowed = name === FRAME_ANCESTORS && framing === "anyone" ? [ANY_SITE] : sources;
      return `${name} ${[...allowed, ...extras].join(" ")}`;
    })
    .join("; ");
}

export function securityHeaders(isDevelopment: boolean, framing: Framing): SecurityHeader[] {
  const frameOptions: SecurityHeader[] = framing === "deny" ? [{ key: "X-Frame-Options", value: "DENY" }] : [];
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDevelopment, framing) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    ...frameOptions,
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}
