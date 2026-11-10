/**
 * Tests for the HTTP security headers.
 * They confirm the production policy blocks framing, plugins and outside sources, and allows exported images.
 * They also confirm the development-only allowances never reach production, and only the embed page may be framed.
 */
import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "./securityHeaders";

describe("contentSecurityPolicy", () => {
  const production = contentSecurityPolicy(false, "deny");

  it("blocks framing and plugins, and keeps everything else on this site", () => {
    expect(production).toContain("frame-ancestors 'none'");
    expect(production).toContain("object-src 'none'");
    expect(production).toContain("default-src 'self'");
    expect(production).toContain("connect-src 'self';");
  });

  it("allows the data and blob images that image export uses", () => {
    expect(production).toContain("img-src 'self' data: blob:");
  });

  it("keeps eval and websockets out of production", () => {
    expect(production).not.toContain("unsafe-eval");
    expect(production).not.toContain("ws:");
    expect(contentSecurityPolicy(true, "deny")).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(true, "deny")).toContain("connect-src 'self' ws:");
  });
});

describe("securityHeaders", () => {
  it("sends each header once", () => {
    const keys = securityHeaders(false, "deny").map(({ key }) => key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(expect.arrayContaining(["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy"]));
  });
});

describe("the embed page", () => {
  it("may be framed by any site, with the rest of the policy unchanged", () => {
    const embed = contentSecurityPolicy(false, "anyone");
    expect(embed).toContain("frame-ancestors *");
    expect(embed).not.toContain("frame-ancestors 'none'");
    expect(embed.replace("frame-ancestors *", "")).toBe(contentSecurityPolicy(false, "deny").replace("frame-ancestors 'none'", ""));
    expect(securityHeaders(false, "anyone").map(({ key }) => key)).not.toContain("X-Frame-Options");
    expect(securityHeaders(false, "deny")).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});
