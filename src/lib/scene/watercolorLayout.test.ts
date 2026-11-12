/**
 * Tests for Watercolor's hill washes.
 * They confirm each hill path spans the whole width, is closed along the bottom and stays above the ground line.
 * They also confirm the same inputs always give the same path, so the scene never flickers.
 */
import { describe, expect, it } from "vitest";
import { HILL_LAYERS, hillPath } from "./watercolorLayout";

const WIDTH = 1000;
const GROUND = 600;
const BOTTOM = 700;

function heights(path: string): number[] {
  return [...path.matchAll(/L([\d.]+) ([\d.]+)/g)].map((match) => Number(match[2]));
}

describe("hillPath", () => {
  it("runs from the left edge to the right and closes along the bottom", () => {
    const path = hillPath(WIDTH, GROUND, BOTTOM, HILL_LAYERS[0]);
    expect(path.startsWith(`M0 ${BOTTOM} L0 `)).toBe(true);
    expect(path.endsWith(`L${WIDTH} ${BOTTOM} Z`)).toBe(true);
  });

  it("keeps every layer's hills above the ground line", () => {
    for (const layer of HILL_LAYERS) {
      const tops = heights(hillPath(WIDTH, GROUND, BOTTOM, layer)).filter((y) => y !== BOTTOM);
      expect(Math.max(...tops)).toBeLessThan(GROUND);
    }
  });

  it("is the same every time", () => {
    expect(hillPath(WIDTH, GROUND, BOTTOM, HILL_LAYERS[1])).toBe(hillPath(WIDTH, GROUND, BOTTOM, HILL_LAYERS[1]));
  });
});
