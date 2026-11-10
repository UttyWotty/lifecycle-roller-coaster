/**
 * Tests for choosing Ride it sounds.
 * They confirm climbs and drops get their own sounds sized by steepness, and level or instant moves stay silent.
 * They also confirm stops sound by their level, the current step is found from the clock, and a non-stop ride
 * still sounds every stop it passes between frames.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { polylineSamples, type TimelineStep } from "./ridePlayback";
import { cueForStep, stepIndexAt, stepsToSound } from "./rideSounds";

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
const RESTING = { start: 0, end: 0 };

function move(from: number, to: number, duration = 1): TimelineStep {
  return { kind: "move", from, to, start: 0, duration, ends: RESTING };
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
    { kind: "move", from: 0, to: 10, start: 0, duration: 1, ends: RESTING },
    { kind: "pause", stopIndex: 0, at: 10, start: 1, duration: 2 },
  ];

  it("finds the step under way and reports the end after the last", () => {
    expect(stepIndexAt(steps, 0.5)).toBe(0);
    expect(stepIndexAt(steps, 1)).toBe(1);
    expect(stepIndexAt(steps, 5)).toBe(2);
  });
});

describe("stepsToSound", () => {
  const steps: TimelineStep[] = [
    { kind: "move", from: 0, to: 10, start: 0, duration: 1, ends: RESTING },
    { kind: "pause", stopIndex: 0, at: 10, start: 1, duration: 0 },
    { kind: "move", from: 10, to: 20, start: 1, duration: 1, ends: RESTING },
    { kind: "pause", stopIndex: 1, at: 20, start: 2, duration: 2 },
    { kind: "move", from: 20, to: 30, start: 4, duration: 1, ends: RESTING },
  ];

  it("sounds nothing while the same step is under way", () => {
    expect(stepsToSound(steps, 2, 2)).toEqual([]);
  });

  it("sounds a stop that took no time along with the move after it", () => {
    expect(stepsToSound(steps, 0, 2)).toEqual([1, 2]);
  });

  it("skips moves and timed stops jumped over, and sounds only the current step after a jump or going back", () => {
    expect(stepsToSound(steps, 0, 4)).toEqual([1, 4]);
    expect(stepsToSound(steps, -1, 2)).toEqual([2]);
    expect(stepsToSound(steps, 4, 0)).toEqual([0]);
  });

  it("sounds the finish after the last step", () => {
    expect(stepsToSound(steps, 4, 5)).toEqual([5]);
  });
});
