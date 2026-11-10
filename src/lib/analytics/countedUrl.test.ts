/**
 * Tests for the page-view privacy rules.
 * They confirm shared rides in the "#" part and query strings are removed before anything is counted.
 * They also confirm unreadable addresses are dropped and only the live site counts at all.
 */
import { describe, expect, it } from "vitest";
import { countedUrl, shouldCountPageViews } from "./countedUrl";

describe("countedUrl", () => {
  it("keeps only the origin and path", () => {
    expect(countedUrl("https://example.com/ride#r=eyJ2IjoxfQ")).toBe("https://example.com/ride");
    expect(countedUrl("https://example.com/together?x=1#a=abc&b=def")).toBe("https://example.com/together");
    expect(countedUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("drops an address it cannot read", () => {
    expect(countedUrl("not a url")).toBeNull();
    expect(countedUrl("data:text/plain,SECRET")).toBeNull();
    expect(countedUrl("blob:https://example.com/abc")).toBeNull();
  });
});

describe("shouldCountPageViews", () => {
  it("counts only on the live site", () => {
    expect(shouldCountPageViews("production")).toBe(true);
    for (const environment of ["preview", "development", undefined, ""]) {
      expect(shouldCountPageViews(environment)).toBe(false);
    }
  });
});
