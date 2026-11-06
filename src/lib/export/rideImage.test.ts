/**
 * Tests for preparing a ride drawing as a standalone image.
 * They confirm no theme dependency survives, and that the image gets a background and wordmark.
 * They also confirm that user text is left alone and that very long rides stay inside canvas limits.
 */
import { describe, expect, it } from "vitest";
import { exportScale, prepareRideSvg } from "./rideImage";

const SIZE = { width: 800, height: 460 };
const MARKUP =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460">' +
  '<path stroke="var(--accent)"/><circle stroke="var(--background)"/>' +
  '<line stroke="currentColor"/><text fill="var(--muted)">Got married</text>' +
  '<rect fill="var(--unknown)"/></svg>';

describe("prepareRideSvg", () => {
  const prepared = prepareRideSvg(MARKUP, SIZE);

  it("leaves no theme variables or currentColor", () => {
    expect(prepared).not.toContain("var(");
    expect(prepared).not.toContain("currentColor");
  });

  it("uses the fixed light palette", () => {
    expect(prepared).toContain('stroke="#e11d48"');
    expect(prepared).toContain('stroke="#ffffff"');
    expect(prepared).toContain('fill="#5b5b66"');
  });

  it("falls back for an unknown variable", () => {
    expect(prepared).toContain('<rect fill="#171717"/>');
  });

  it("sets an explicit size, font and first-drawn background", () => {
    expect(prepared).toMatch(/^<svg [^>]*width="800" height="460" font-family="Arial/);
    expect(prepared).toContain('><rect width="800" height="460" fill="#ffffff"/><path');
  });

  it("keeps the namespace and adds the wordmark last", () => {
    expect(prepared).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(prepared).toMatch(/Lifecycle Roller Coaster<\/text><\/svg>$/);
  });

  it("does not rewrite words in a user's title", () => {
    const titled = '<svg><text fill="currentColor">var(--accent) and currentColor</text></svg>';
    expect(prepareRideSvg(titled, SIZE)).toContain(">var(--accent) and currentColor<");
  });
});

describe("exportScale", () => {
  it("uses double resolution for normal rides", () => {
    expect(exportScale(SIZE)).toBe(2);
  });

  it("shrinks for very wide rides so no edge passes the canvas limit", () => {
    const size = { width: 34_000, height: 460 };
    expect(size.width * exportScale(size)).toBeCloseTo(8192);
  });

  it("stays at double resolution exactly at the limit", () => {
    expect(exportScale({ width: 4096, height: 460 })).toBe(2);
  });
});
