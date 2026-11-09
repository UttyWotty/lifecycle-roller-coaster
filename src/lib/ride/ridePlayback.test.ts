/**
 * Tests for the Ride it timing and geometry.
 * They confirm stops are found along the rail in order, loops are ridden after a stop, and climbs take longer than drops.
 * They also confirm the timeline pauses at every stop, can jump to a stop, and finishes at the end of the rail.
 */
import { describe, expect, it } from "vitest";
import {
  STOP_PAUSE_SECONDS,
  buildTimeline,
  moveSeconds,
  polylineSamples,
  poseAt,
  positionAt,
  stopLengths,
  stopStartTime,
  type RailSample,
} from "./ridePlayback";

const HEIGHT = 500;
const FLAT = polylineSamples([
  { x: 0, y: 100 },
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 300, y: 100 },
]);
const STOPS = [
  { x: 100, y: 100 },
  { x: 200, y: 100 },
];

/** A rail that reaches a stop, loops above it and comes back, then carries on. */
function loopRail(): RailSample[] {
  const points = [{ x: 0, y: 100 }, { x: 100, y: 100 }];
  for (let step = 1; step <= 16; step += 1) {
    const turn = (step / 16) * 2 * Math.PI;
    points.push({ x: 100 + 30 * Math.sin(turn), y: 70 + 30 * Math.cos(turn) });
  }
  points.push({ x: 200, y: 100 });
  return polylineSamples(points);
}

describe("polylineSamples", () => {
  it("measures distance along the route", () => {
    expect(FLAT.map(({ length }) => length)).toEqual([0, 100, 200, 300]);
  });
});

describe("stopLengths", () => {
  it("finds each stop in order", () => {
    expect(stopLengths(FLAT, STOPS)).toEqual([100, 200]);
  });

  it("takes the arrival at a looped stop, so the loop comes after the pause", () => {
    const rail = loopRail();
    const [looped, next] = stopLengths(rail, [{ x: 100, y: 100 }, { x: 200, y: 100 }]);
    expect(looped).toBe(100);
    expect(next).toBeGreaterThan(100 + 2 * Math.PI * 30 * 0.9);
  });
});

describe("poseAt", () => {
  it("interpolates between samples and faces along the rail", () => {
    expect(poseAt(FLAT, 150)).toEqual({ x: 150, y: 100, angle: 0 });
  });

  it("points down a drop", () => {
    const drop = polylineSamples([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    expect(poseAt(drop, 50).angle).toBeCloseTo(45);
  });
});

describe("moveSeconds", () => {
  it("makes a climb slower than a drop of the same size", () => {
    const low = { x: 0, y: 400 };
    const high = { x: 0, y: 100 };
    expect(moveSeconds(300, low, high, HEIGHT)).toBeGreaterThan(moveSeconds(300, high, low, HEIGHT));
  });
});

describe("buildTimeline and positionAt", () => {
  const timeline = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: false });

  it("pauses at every stop in order and ends at the rail's end", () => {
    const pauses = timeline.steps.filter((step) => step.kind === "pause");
    expect(pauses.map((step) => step.kind === "pause" && step.stopIndex)).toEqual([0, 1]);
    expect(positionAt(timeline, timeline.duration)).toEqual({ length: 300, stopIndex: 1, isFinished: true });
  });

  it("shows no stop before the first and holds still during a pause", () => {
    expect(positionAt(timeline, 0).stopIndex).toBeNull();
    const pauseStart = stopStartTime(timeline, 0);
    const during = positionAt(timeline, pauseStart + STOP_PAUSE_SECONDS / 2);
    expect(during).toEqual({ length: 100, stopIndex: 0, isFinished: false });
  });

  it("keeps the last stop's story while moving on", () => {
    const leaving = stopStartTime(timeline, 0) + STOP_PAUSE_SECONDS + 0.01;
    const position = positionAt(timeline, leaving);
    expect(position.stopIndex).toBe(0);
    expect(position.length).toBeGreaterThan(100);
  });

  it("jumps straight between stops when motion is reduced", () => {
    const instant = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: true });
    expect(instant.duration).toBe(STOP_PAUSE_SECONDS * STOPS.length);
    expect(positionAt(instant, 0)).toEqual({ length: 100, stopIndex: 0, isFinished: false });
  });

  it("handles a ride with no stops", () => {
    const empty = buildTimeline(FLAT, [], { trackHeight: HEIGHT, isInstant: false });
    expect(positionAt(empty, empty.duration).isFinished).toBe(true);
  });
});
