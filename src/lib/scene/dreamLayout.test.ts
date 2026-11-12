/**
 * Tests for Dreamland's layout.
 * They confirm rainbows are spread evenly, one or more depending on width, and never taller than the sky allows.
 * They also confirm the cloud floor covers the whole width with a repeating rhythm of puff sizes.
 */
import { describe, expect, it } from "vitest";
import { PUFF_RADII, PUFF_SPACING, RAINBOW_SPACING, cloudFloor, rainbows } from "./dreamLayout";

describe("rainbows", () => {
  it("puts one rainbow in the middle of a short ride", () => {
    expect(rainbows(600, 400)).toEqual([{ x: 300, radius: 400 * 0.62 }]);
  });

  it("spreads several over a long ride, each in its own equal stretch", () => {
    const width = RAINBOW_SPACING * 3;
    expect(rainbows(width, 2000).map(({ x }) => x)).toEqual([450, 1350, 2250]);
  });

  it("caps the radius on a tall drawing", () => {
    expect(rainbows(800, 5000)[0].radius).toBe(360);
  });
});

describe("cloudFloor", () => {
  it("covers the whole width, past the right edge", () => {
    const puffs = cloudFloor(1000);
    expect(puffs[0].x).toBe(0);
    expect((puffs.at(-1)?.x ?? 0) + PUFF_SPACING).toBeGreaterThan(1000);
  });

  it("repeats the puff sizes in order", () => {
    const radii = cloudFloor(PUFF_SPACING * PUFF_RADII.length * 2).map(({ radius }) => radius);
    expect(radii.slice(0, PUFF_RADII.length)).toEqual(PUFF_RADII);
    expect(radii.slice(PUFF_RADII.length, PUFF_RADII.length * 2)).toEqual(PUFF_RADII);
  });
});
