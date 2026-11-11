/**
 * Pure layout for the River trip world: where the water runs fast or calm, read from the river's own height profile.
 * Steep stretches get spray, the foot of each big drop a splash, and level stretches lily pads with reeds beside them.
 * Every value is computed from the track, never random, and nothing is placed on top of a stop.
 */
import type { TrackPoint, TrackStop } from "@/lib/track/types";

export interface RapidRun {
  from: TrackPoint;
  to: TrackPoint;
}

export interface SpraySpot extends TrackPoint {
  /** Degrees, along the water's slope. */
  angle: number;
}

/** A stretch this steep or steeper runs fast. */
export const RAPID_SLOPE = 0.9;
/** A stretch this level or more carries lily pads. */
export const CALM_SLOPE = 0.12;
/** A drop at least this tall ends in a splash. */
export const SPLASH_DROP = 100;
const SPRAY_SPACING = 26;
const PAD_SPACING = 110;
const STOP_CLEARANCE = 50;
/** Where reeds stand on either side of a lily pad, and how far they keep from a stop's marker and flag pole. */
const REED_OFFSETS = [-46, -38, 40, 48];
const REED_CLEARANCE = 30;
const DEGREES_PER_RADIAN = 180 / Math.PI;

function slopeOf(a: TrackPoint, b: TrackPoint): number {
  const run = b.x - a.x;
  return run === 0 ? 0 : (b.y - a.y) / run;
}

function isClearOfStops(x: number, stops: readonly Pick<TrackStop, "x">[]): boolean {
  return stops.every((stop) => Math.abs(stop.x - x) >= STOP_CLEARANCE);
}

/** Stretches where the river runs steeply up or down, each from its first to its last steep point. */
export function rapidRuns(profile: readonly TrackPoint[]): RapidRun[] {
  const runs: RapidRun[] = [];
  let start: TrackPoint | null = null;
  profile.slice(1).forEach((point, index) => {
    const previous = profile[index];
    const isSteep = Math.abs(slopeOf(previous, point)) >= RAPID_SLOPE;
    if (isSteep && start === null) {
      start = previous;
    }
    const isLast = index === profile.length - 2;
    if (start !== null && (!isSteep || isLast)) {
      runs.push({ from: start, to: isSteep ? point : previous });
      start = null;
    }
  });
  return runs.filter(({ from, to }) => to.x > from.x);
}

/** Spray along every rapid run, evenly spaced and turned to the slope, away from stops. */
export function spraySpots(runs: readonly RapidRun[], stops: readonly Pick<TrackStop, "x">[]): SpraySpot[] {
  return runs.flatMap(({ from, to }) => {
    const angle = Math.atan(slopeOf(from, to)) * DEGREES_PER_RADIAN;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const count = Math.floor(length / SPRAY_SPACING);
    return Array.from({ length: count }, (_, index) => {
      const share = (index + 0.5) / count;
      return { x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share, angle };
    }).filter(({ x }) => isClearOfStops(x, stops));
  });
}

/** The foot of every drop tall enough to make a splash, unless a stop sits there. */
export function splashes(runs: readonly RapidRun[], stops: readonly Pick<TrackStop, "x">[]): TrackPoint[] {
  return runs
    .filter(({ from, to }) => to.y - from.y >= SPLASH_DROP)
    .map(({ to }) => to)
    .filter(({ x }) => isClearOfStops(x, stops));
}

/** Reeds on either side of each lily pad, leaving out any that would crowd a stop's marker or flag pole. */
export function reedSpots(pads: readonly TrackPoint[], stops: readonly Pick<TrackStop, "x">[]): TrackPoint[] {
  return pads.flatMap(({ x, y }) =>
    REED_OFFSETS.map((offset) => ({ x: x + offset, y })).filter((reed) => stops.every((stop) => Math.abs(stop.x - reed.x) >= REED_CLEARANCE)),
  );
}

/** Lily pads on level stretches, spaced out and kept away from stops. */
export function lilyPads(profile: readonly TrackPoint[], stops: readonly Pick<TrackStop, "x">[]): TrackPoint[] {
  const pads: TrackPoint[] = [];
  let lastX = -Infinity;
  profile.slice(1).forEach((point, index) => {
    const previous = profile[index];
    const middle = { x: (previous.x + point.x) / 2, y: (previous.y + point.y) / 2 };
    const isCalm = Math.abs(slopeOf(previous, point)) <= CALM_SLOPE;
    if (isCalm && middle.x - lastX >= PAD_SPACING && isClearOfStops(middle.x, stops)) {
      pads.push(middle);
      lastX = middle.x;
    }
  });
  return pads;
}
