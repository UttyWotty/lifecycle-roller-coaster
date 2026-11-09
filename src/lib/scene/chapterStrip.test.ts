/**
 * Tests for the chapter strip colours.
 * They confirm the luminance formula at its ends, and that dark-sky themes get a dark strip with light text.
 * They also confirm light themes keep the pale strip and that text always contrasts with its strip.
 */
import { describe, expect, it } from "vitest";
import { chapterStripColors, relativeLuminance } from "./chapterStrip";
import { RIDE_THEME_DETAILS, RIDE_THEMES } from "./themes";

const MIN_CONTRAST = 4.5;
const LUMINANCE_OFFSET = 0.05;

function contrast(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + LUMINANCE_OFFSET) / (dark + LUMINANCE_OFFSET);
}

describe("chapterStripColors", () => {
  it("measures black and white at the ends of the scale", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
  });

  it.each(["space", "arcade", "night", "haunted", "nightmare"] as const)("gives %s a dark strip", (theme) => {
    const palette = RIDE_THEME_DETAILS[theme].palette;
    expect(palette).not.toBeNull();
    if (palette) {
      expect(chapterStripColors(palette)).toEqual({ fill: palette.ground, ink: palette.title });
    }
  });

  it.each(["sunny", "classic", "minimal", "ocean"] as const)("keeps the pale strip for %s", (theme) => {
    const palette = RIDE_THEME_DETAILS[theme].palette;
    if (palette) {
      expect(chapterStripColors(palette)).toEqual({ fill: palette.pill, ink: palette.ink });
    }
  });

  it("keeps chapter names readable on every theme", () => {
    for (const theme of RIDE_THEMES) {
      const palette = RIDE_THEME_DETAILS[theme].palette;
      if (palette) {
        const { fill, ink } = chapterStripColors(palette);
        expect(contrast(fill, ink), theme).toBeGreaterThanOrEqual(MIN_CONTRAST);
      }
    }
  });
});
