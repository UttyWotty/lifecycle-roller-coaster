/**
 * Tests for the Ride it timing and geometry.
 * They confirm stops are found along the rail in order, loops are ridden after a stop, and climbs take longer than drops.
 * They also confirm the timeline pauses just short of every stop, can jump to a stop, and finishes at the end of the rail,
 * that a non-stop ride rolls through every stop without halting, and that a ride driven by x follows the rail through loops.
 */
import { describe, expect, it } from "vitest";
import {
  NON_STOP_PASSING_SPEED,
  PAUSE_SHORT_OF_STOP,
  STOP_PAUSE_SECONDS,
  buildTimeline,
  ease,
  lengthAtX,
  moveSeconds,
  polylineSamples,
  poseAt,
  positionAt,
  railAnchors,
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
const FIRST_PAUSE = 100 - PAUSE_SHORT_OF_STOP;

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
  const timeline = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: false, isNonStop: false });

  it("pauses short of every stop in order and ends at the rail's end", () => {
    const pauses = timeline.steps.filter((step) => step.kind === "pause");
    expect(pauses.map((step) => step.kind === "pause" && step.stopIndex)).toEqual([0, 1]);
    expect(pauses.map((step) => step.kind === "pause" && step.at)).toEqual([FIRST_PAUSE, 200 - PAUSE_SHORT_OF_STOP]);
    expect(positionAt(timeline, timeline.duration)).toEqual({ length: 300, stopIndex: 1, isFinished: true });
  });

  it("shows no stop before the first and holds still during a pause", () => {
    expect(positionAt(timeline, 0).stopIndex).toBeNull();
    const pauseStart = stopStartTime(timeline, 0);
    const during = positionAt(timeline, pauseStart + STOP_PAUSE_SECONDS / 2);
    expect(during).toEqual({ length: FIRST_PAUSE, stopIndex: 0, isFinished: false });
  });

  it("keeps the last stop's story while moving on", () => {
    const leaving = stopStartTime(timeline, 0) + STOP_PAUSE_SECONDS + 0.01;
    const position = positionAt(timeline, leaving);
    expect(position.stopIndex).toBe(0);
    expect(position.length).toBeGreaterThan(FIRST_PAUSE);
  });

  it("jumps straight between stops when motion is reduced", () => {
    const instant = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: true, isNonStop: false });
    expect(instant.duration).toBe(STOP_PAUSE_SECONDS * STOPS.length);
    expect(positionAt(instant, 0)).toEqual({ length: FIRST_PAUSE, stopIndex: 0, isFinished: false });
  });

  it("never pauses behind where the cart already is", () => {
    const close = buildTimeline(FLAT, [{ x: 10, y: 100 }], { trackHeight: HEIGHT, isInstant: false, isNonStop: false });
    expect(close.steps.find((step) => step.kind === "pause")).toMatchObject({ at: 0 });
  });

  it("handles a ride with no stops", () => {
    const empty = buildTimeline(FLAT, [], { trackHeight: HEIGHT, isInstant: false, isNonStop: false });
    expect(positionAt(empty, empty.duration).isFinished).toBe(true);
  });
});

describe("non-stop rides", () => {
  const stopping = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: false, isNonStop: false });
  const nonStop = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: false, isNonStop: true });
  const TINY = 0.001;

  it("takes no time at a stop, so the ride is shorter by every pause", () => {
    expect(nonStop.steps.filter((step) => step.kind === "pause").map((step) => step.duration)).toEqual([0, 0]);
    expect(nonStop.duration).toBeCloseTo(stopping.duration - STOP_PAUSE_SECONDS * STOPS.length);
  });

  it("starts and ends at rest and keeps moving through every stop", () => {
    const moves = nonStop.steps.flatMap((step) => (step.kind === "move" ? [step.ends] : []));
    expect(moves).toEqual([
      { start: 0, end: NON_STOP_PASSING_SPEED },
      { start: NON_STOP_PASSING_SPEED, end: NON_STOP_PASSING_SPEED },
      { start: NON_STOP_PASSING_SPEED, end: 0 },
    ]);
    const at = stopStartTime(nonStop, 0);
    expect(positionAt(nonStop, at + TINY).length).toBeGreaterThan(positionAt(nonStop, at - TINY).length);
  });

  it("still reaches each stop in order and finishes at the rail's end", () => {
    expect(positionAt(nonStop, stopStartTime(nonStop, 0) + TINY).stopIndex).toBe(0);
    expect(positionAt(nonStop, stopStartTime(nonStop, 1) + TINY).stopIndex).toBe(1);
    expect(positionAt(nonStop, nonStop.duration)).toEqual({ length: 300, stopIndex: 1, isFinished: true });
  });

  it("keeps its pauses when motion is reduced, so each stop is still shown", () => {
    const instant = buildTimeline(FLAT, STOPS, { trackHeight: HEIGHT, isInstant: true, isNonStop: true });
    expect(instant.duration).toBe(STOP_PAUSE_SECONDS * STOPS.length);
  });
});

describe("ease", () => {
  const rest = { start: 0, end: 0 };
  const rolling = { start: NON_STOP_PASSING_SPEED, end: NON_STOP_PASSING_SPEED };
  const SHARES = Array.from({ length: 21 }, (_, index) => index / 20);

  it("runs from the start to the end of a move", () => {
    for (const ends of [rest, rolling, { start: 0, end: 1 }, { start: 1, end: 0 }]) {
      expect(ease(0, ends)).toBe(0);
      expect(ease(1, ends)).toBeCloseTo(1);
    }
  });

  it("never goes backwards, for any end speeds from rest to full", () => {
    for (const ends of [rolling, { start: 0, end: 1 }, { start: 1, end: 1 }]) {
      SHARES.slice(1).forEach((share, index) => expect(ease(share, ends)).toBeGreaterThanOrEqual(ease(SHARES[index], ends)));
    }
  });

  it("passes the ends of a rolling move at the given speed", () => {
    const step = 1e-4;
    expect(ease(step, rolling) / step).toBeCloseTo(NON_STOP_PASSING_SPEED, 2);
    expect((1 - ease(1 - step, rolling)) / step).toBeCloseTo(NON_STOP_PASSING_SPEED, 2);
  });
});

describe("railAnchors and lengthAtX", () => {
  it("follows a straight rail by x", () => {
    const anchors = railAnchors(FLAT, STOPS);
    expect(anchors.map(({ x }) => x)).toEqual([0, 100, 200, 300]);
    expect(lengthAtX(anchors, 150)).toBe(150);
  });

  it("rides the loop after a stop on the way to the next one", () => {
    const rail = loopRail();
    const anchors = railAnchors(rail, [{ x: 100, y: 100 }, { x: 200, y: 100 }]);
    const railEnd = rail.at(-1)?.length ?? 0;
    expect(lengthAtX(anchors, 100)).toBe(100);
    const halfway = lengthAtX(anchors, 150);
    expect(halfway).toBeGreaterThan(100 + Math.PI * 30 * 0.9);
    expect(lengthAtX(anchors, 200)).toBe(railEnd);
  });

  it("holds at either end and copes with an empty rail", () => {
    const anchors = railAnchors(FLAT, STOPS);
    expect(lengthAtX(anchors, -10)).toBe(0);
    expect(lengthAtX(anchors, 999)).toBe(300);
    expect(lengthAtX(railAnchors([], STOPS), 50)).toBe(0);
  });
});
