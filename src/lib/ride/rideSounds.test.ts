/**
 * Tests for choosing Ride it sounds.
 * They confirm climbs and drops get their own sounds sized by steepness, and level or instant moves stay silent.
 * They also confirm stops sound by their level, and the current step is found from the clock.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { polylineSamples, type TimelineStep } from "./ridePlayback";
import { cueForStep, stepIndexAt } from "./rideSounds";

const HEIGHT = 400;
const SAMPLES = polylineSamples([
  { x: 0, y: 300 },
  { x: 100, y: 100 },
  { x: 200, y: 300 },
  { x: 300, y: 302 },
]);

function stop(level: number, impact: number): TrackStop {
  return {
    id: "s", x: 0, y: 0, level, title: "", date: null, category: "career",
    sentiment: "positive", impact, isMajor: false, labelSide: "above",
  };
}

const CONTEXT = { samples: SAMPLES, stops: [stop(7, 7), stop(-4, 4), stop(0, 2)], trackHeight: HEIGHT };
const LEG = SAMPLES[1].length;

function move(from: number, to: number, duration = 1): TimelineStep {
  return { kind: "move", from, to, start: 0, duration };
}

describe("cueForStep", () => {
  it("clacks up a climb and whooshes down a drop, sized by steepness", () => {
    expect(cueForStep(move(0, LEG), CONTEXT)).toEqual({ kind: "climb", seconds: 1, strength: 0.5 });
    expect(cueForStep(move(LEG, SAMPLES[2].length), CONTEXT)).toMatchObject({ kind: "drop", strength: 0.5 });
  });

  it("stays quiet on level track and when moves are instant", () => {
    expect(cueForStep(move(SAMPLES[2].length, SAMPLES[3].length), CONTEXT)).toBeNull();
    expect(cueForStep(move(0, LEG, 0), CONTEXT)).toBeNull();
  });

  it("sounds a stop by whether it is a high, a low or neutral", () => {
    const pause = (stopIndex: number): TimelineStep => ({ kind: "pause", stopIndex, at: 0, start: 0, duration: 1 });
    expect(cueForStep(pause(0), CONTEXT)).toEqual({ kind: "high", strength: 0.7 });
    expect(cueForStep(pause(1), CONTEXT)).toEqual({ kind: "low", strength: 0.4 });
    expect(cueForStep(pause(2), CONTEXT)).toEqual({ kind: "neutral" });
    expect(cueForStep(pause(9), CONTEXT)).toBeNull();
  });
});

describe("stepIndexAt", () => {
  const steps: TimelineStep[] = [
    { kind: "move", from: 0, to: 10, start: 0, duration: 1 },
    { kind: "pause", stopIndex: 0, at: 10, start: 1, duration: 2 },
  ];

  it("finds the step under way and reports the end after the last", () => {
    expect(stepIndexAt(steps, 0.5)).toBe(0);
    expect(stepIndexAt(steps, 1)).toBe(1);
    expect(stepIndexAt(steps, 5)).toBe(2);
  });
});
