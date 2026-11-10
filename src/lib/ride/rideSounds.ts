/**
 * Pure choice of the sound for each moment of Ride it: a click-clack climb, a whoosh drop, a chime at a high, a low note
 * at a low, a soft tone for a neutral stop, and a fanfare at the finish.
 * Sizes come from how steep a move is and how much a stop mattered, so bigger moments sound bigger.
 * It only describes sounds; the browser player turns each cue into audio, so this module needs no audio support.
 */
import type { TrackStop } from "@/lib/track/types";
import { poseAt, type RailSample, type TimelineStep } from "./ridePlayback";

export type SoundCue =
  | { kind: "climb"; seconds: number; strength: number }
  | { kind: "drop"; seconds: number; strength: number }
  | { kind: "high"; strength: number }
  | { kind: "low"; strength: number }
  | { kind: "neutral" }
  | { kind: "finish" };

interface CueContext {
  samples: readonly RailSample[];
  stops: readonly TrackStop[];
  trackHeight: number;
}

/** A move that changes height by less than this share of the track is level and makes no sound. */
const LEVEL_SHARE = 0.04;
const MAX_IMPACT = 10;
const NO_TIME = 0;

function clampShare(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function moveCue(step: Extract<TimelineStep, { kind: "move" }>, context: CueContext): SoundCue | null {
  if (step.duration <= NO_TIME) {
    return null;
  }
  const from = poseAt(context.samples, step.from);
  const to = poseAt(context.samples, step.to);
  const share = (to.y - from.y) / Math.max(context.trackHeight, 1);
  if (Math.abs(share) < LEVEL_SHARE) {
    return null;
  }
  const strength = clampShare(Math.abs(share));
  return share < 0
    ? { kind: "climb", seconds: step.duration, strength }
    : { kind: "drop", seconds: step.duration, strength };
}

function stopCue(stop: TrackStop | undefined): SoundCue | null {
  if (stop === undefined) {
    return null;
  }
  const strength = clampShare(stop.impact / MAX_IMPACT);
  if (stop.level > 0) {
    return { kind: "high", strength };
  }
  return stop.level < 0 ? { kind: "low", strength } : { kind: "neutral" };
}

/** The sound that starts with a step of the ride, or null when that step is silent. Screen y grows downward. */
export function cueForStep(step: TimelineStep, context: CueContext): SoundCue | null {
  return step.kind === "move" ? moveCue(step, context) : stopCue(context.stops[step.stopIndex]);
}

/** The sound played when the cart reaches the end. */
export const FINISH_CUE: SoundCue = { kind: "finish" };

/**
 * The steps whose sounds start now that the ride has moved from one step to another. On a non-stop ride a stop takes
 * no time, so the clock passes it between frames; its chime still sounds, together with the move that follows.
 * After a jump, or when going back, only the step now under way sounds.
 */
export function stepsToSound(steps: readonly TimelineStep[], previous: number, current: number): number[] {
  if (current === previous) {
    return [];
  }
  if (previous < 0 || current < previous) {
    return [current];
  }
  const passed = steps.slice(previous + 1, current).flatMap((step, offset) =>
    step.kind === "pause" && step.duration <= NO_TIME ? [previous + 1 + offset] : [],
  );
  return [...passed, current];
}

/** Which step of the timeline is under way at a moment, so a player knows when a new one begins. */
export function stepIndexAt(steps: readonly TimelineStep[], elapsed: number): number {
  const index = steps.findIndex((step) => elapsed < step.start + step.duration);
  return index === -1 ? steps.length : index;
}
