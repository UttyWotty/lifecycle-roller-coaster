/**
 * Tests for the shared geometry of stop labels, flags and markers.
 * They confirm labels sit above or below their stop as the ride draws them, with tall poles alternating.
 * They also confirm the overlap check that keeps decorations off labels.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import {
  boxesOverlap,
  isTallStop,
  labelBox,
  MAJOR_MARKER_RADIUS,
  MARKER_RADIUS,
  markerRadius,
  PILL_HEIGHT,
  pillTop,
  pillWidth,
} from "./labelLayout";

const FLAGGED = { isStation: false, isBare: false } as const;
const BARE = { isStation: false, isBare: true } as const;

function makeStop(overrides: Partial<TrackStop>): TrackStop {
  return {
    id: "a",
    x: 400,
    y: 300,
    level: 0,
    title: "Got married",
    date: "2020",
    category: "other",
    sentiment: "positive",
    impact: 5,
    isMajor: false,
    labelSide: "above",
    ...overrides,
  };
}

describe("label layout", () => {
  it("uses a bigger marker for major stops", () => {
    expect(markerRadius(makeStop({}))).toBe(MARKER_RADIUS);
    expect(markerRadius(makeStop({ isMajor: true }))).toBe(MAJOR_MARKER_RADIUS);
  });

  it("alternates tall poles and always raises the last one", () => {
    expect([0, 1, 2, 3].map((index) => isTallStop(index, 5))).toEqual([true, false, true, false]);
    expect(isTallStop(3, 4)).toBe(true);
  });

  it("sizes a pill by its longer line", () => {
    expect(pillWidth("Hi", "Date unknown")).toBe(pillWidth("Date unknown", "Hi"));
    expect(pillWidth("A much longer title", "2020")).toBeGreaterThan(pillWidth("Short", "2020"));
  });

  it("raises a tall flag's pill above a short one, and both sit above the stop", () => {
    const stop = makeStop({});
    const tall = pillTop(stop, true, FLAGGED);
    const short = pillTop(stop, false, FLAGGED);
    expect(tall).toBeLessThan(short);
    expect(short + PILL_HEIGHT).toBeLessThan(stop.y);
  });

  it("hangs a drop's pill below the stop, and keeps a bare label close above it", () => {
    expect(pillTop(makeStop({ labelSide: "below" }), true, FLAGGED)).toBeGreaterThan(300);
    expect(pillTop(makeStop({}), true, BARE)).toBeGreaterThan(pillTop(makeStop({}), true, FLAGGED));
  });

  it("covers the pill and the marker in one box centred on the stop", () => {
    const stop = makeStop({});
    const box = labelBox(stop, true, FLAGGED);
    expect(box.x + box.width / 2).toBeCloseTo(stop.x);
    expect(box.y).toBe(pillTop(stop, true, FLAGGED));
    expect(box.y + box.height).toBe(stop.y + MARKER_RADIUS);
  });

  it("detects overlap only when boxes share area", () => {
    const box = { x: 0, y: 0, width: 10, height: 10 };
    expect(boxesOverlap(box, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    expect(boxesOverlap(box, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(boxesOverlap(box, { x: 0, y: 11, width: 10, height: 10 })).toBe(false);
  });
});
