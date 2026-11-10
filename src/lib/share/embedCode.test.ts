/**
 * Tests for the snippet that embeds a ride on another website.
 * They confirm it frames the embed page with the ride in the fragment, and names the ride for screen readers.
 * They also confirm a hostile title cannot break out of its attribute.
 */
import { describe, expect, it } from "vitest";
import { embedCode } from "./embedCode";

describe("embedCode", () => {
  it("frames the embed page with the ride in the fragment", () => {
    const code = embedCode("https://example.app", "r=abc", "My life");
    expect(code).toMatch(/^<iframe src="https:\/\/example\.app\/embed#r=abc" title="My life - Lifecycle Roller Coaster" /);
    expect(code).toContain('loading="lazy"');
    expect(code.endsWith("></iframe>")).toBe(true);
  });

  it("names an untitled ride", () => {
    expect(embedCode("https://example.app", "r=abc", "  ")).toContain('title="A ride - Lifecycle Roller Coaster"');
  });

  it("escapes a hostile title so it stays inside its attribute", () => {
    const code = embedCode("https://example.app", "r=abc", `"><script>alert(1)</script><x a='`);
    expect(code).not.toContain("<script>");
    expect(code).not.toMatch(/title="[^"]*"[^ ]/);
    expect(code.match(/<iframe /g)).toHaveLength(1);
    expect(code).toContain("&quot;&gt;&lt;script&gt;");
  });
});
