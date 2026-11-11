/**
 * Tests for the River trip world's layout.
 * They confirm steep stretches become rapid runs with spray along them, and big drops end in a splash.
 * They also confirm lily pads float only on level stretches away from stops, and reeds never crowd a stop.
 */
import { describe, expect, it } from "vitest";
import { lilyPads, rapidRuns, reedSpots, splashes, spraySpots } from "./riverLayout";

/** Level, then a steep drop of 200, then level again, then a gentle rise. */
const PROFILE = [
  { x: 0, y: 100 },
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 250, y: 200 },
  { x: 300, y: 300 },
  { x: 400, y: 300 },
  { x: 500, y: 300 },
  { x: 600, y: 280 },
];

describe("rapidRuns", () => {
  it("finds the steep stretch from its first to its last steep point", () => {
    expect(rapidRuns(PROFILE)).toEqual([{ from: { x: 200, y: 100 }, to: { x: 300, y: 300 } }]);
  });

  it("closes a run that reaches the end of the river", () => {
    expect(rapidRuns([{ x: 0, y: 0 }, { x: 10, y: 50 }])).toEqual([{ from: { x: 0, y: 0 }, to: { x: 10, y: 50 } }]);
  });
});

describe("spray and splashes", () => {
  it("sprays along the drop, turned to the slope, and splashes at its foot", () => {
    const runs = rapidRuns(PROFILE);
    const spray = spraySpots(runs, []);
    expect(spray.length).toBeGreaterThan(4);
    expect(spray.every(({ x }) => x > 200 && x < 300)).toBe(true);
    expect(spray[0].angle).toBeCloseTo(63.43, 1);
    expect(splashes(runs, [])).toEqual([{ x: 300, y: 300 }]);
    expect(splashes(runs, [{ x: 310 }])).toEqual([]);
  });

  it("keeps spray off stops and makes no splash for a climb", () => {
    expect(spraySpots(rapidRuns(PROFILE), [{ x: 250 }]).every(({ x }) => Math.abs(x - 250) >= 50)).toBe(true);
    expect(splashes([{ from: { x: 0, y: 300 }, to: { x: 50, y: 100 } }], [])).toEqual([]);
  });
});

describe("reedSpots", () => {
  it("stands reeds beside each pad but never close to a stop", () => {
    expect(reedSpots([{ x: 200, y: 50 }], []).map(({ x }) => x)).toEqual([154, 162, 240, 248]);
    expect(reedSpots([{ x: 200, y: 50 }], [{ x: 245 }]).map(({ x }) => x)).toEqual([154, 162]);
  });
});

describe("lilyPads", () => {
  it("floats pads only on level stretches, spaced out and away from stops", () => {
    const pads = lilyPads(PROFILE, [{ x: 450 }]);
    expect(pads.map(({ x }) => x)).toEqual([50, 350]);
    expect(pads.every(({ y }) => y === 100 || y === 300)).toBe(true);
  });
});
