/**
 * Tests for Surreal dream's layout.
 * They confirm boulders and doorways repeat at a fixed rhythm with sizes taken in turn, at least one of each.
 * They also confirm every shadow reaches right toward the horizon, longer for taller things, never past the horizon.
 */
import { describe, expect, it } from "vitest";
import { DOOR_SPACING, ROCK_DROPS, ROCK_SPACING, SHADOW_LENGTH, doorways, floatingRocks, shadowEnd } from "./surrealLayout";

describe("floatingRocks and doorways", () => {
  it("repeat along the width with sizes in turn", () => {
    const rocks = floatingRocks(ROCK_SPACING * 3);
    expect(rocks).toHaveLength(3);
    expect(rocks.map(({ drop }) => drop)).toEqual(ROCK_DROPS);
    expect(doorways(DOOR_SPACING * 2)).toHaveLength(2);
  });

  it("always have at least one of each on a short ride", () => {
    expect(floatingRocks(100)).toHaveLength(1);
    expect(doorways(100)).toHaveLength(1);
  });

  it("keep doors and rocks from lining up", () => {
    const rockXs = floatingRocks(ROCK_SPACING * 4).map(({ x }) => x);
    const doorXs = doorways(ROCK_SPACING * 4).map(({ x }) => x);
    expect(doorXs.some((x) => rockXs.includes(x))).toBe(false);
  });
});

describe("shadowEnd", () => {
  const DEEP = 1000;

  it("reaches right and up toward the horizon, longer for taller things", () => {
    const short = shadowEnd(100, 500, 50, DEEP);
    const tall = shadowEnd(100, 500, 100, DEEP);
    expect(short.x).toBe(100 + 50 * SHADOW_LENGTH);
    expect(tall.x - 100).toBe((short.x - 100) * 2);
    expect(tall.y).toBeLessThan(500);
  });

  it("never reaches past the horizon", () => {
    expect(shadowEnd(100, 500, 10000, 150).y).toBeGreaterThan(500 - 150);
  });

  it("has no length for something flat", () => {
    expect(shadowEnd(100, 500, 0, DEEP)).toEqual({ x: 100, y: 500 });
  });
});
