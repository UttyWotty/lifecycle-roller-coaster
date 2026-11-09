/**
 * Pure timing and geometry for Ride it, the guided playback where the cart rides the track stop by stop.
 * It turns samples of the rail into each stop's distance along it, a timeline of moves and pauses, and the cart's
 * position and heading at any moment; climbs take longer than drops, and loops are ridden on the way out of a stop.
 * It holds no clock and touches no DOM, so the browser hook only measures the rail and asks it where the cart is.
 */
import type { TrackPoint } from "@/lib/track/types";

export interface RailSample extends TrackPoint {
  /** Distance along the rail from its start. */
  length: number;
}

export interface CartPose extends TrackPoint {
  /** Heading in degrees, 0 pointing right, as SVG rotate expects. */
  angle: number;
}

interface Move {
  kind: "move";
  from: number;
  to: number;
  start: number;
  duration: number;
}

interface Pause {
  kind: "pause";
  stopIndex: number;
  at: number;
  start: number;
  duration: number;
}

export type TimelineStep = Move | Pause;

export interface Timeline {
  steps: readonly TimelineStep[];
  duration: number;
}

export interface PlaybackPosition {
  length: number;
  /** The stop whose story is shown: the one being paused at, or the last one reached. Null before the first. */
  stopIndex: number | null;
  isFinished: boolean;
}

export interface TimelineSettings {
  /** The track's drawing height, which sets how steep a move feels. */
  trackHeight: number;
  /** Moves take no time, for people who prefer reduced motion. */
  isInstant: boolean;
}

/** Cart speed on level track, in drawing pixels per second. */
const LEVEL_SPEED = 260;
const SHORTEST_MOVE_SECONDS = 0.6;
/** A climb across the whole height takes this much longer, and a drop as much shorter. */
const CLIMB_SLOWDOWN = 1.2;
const DROP_SPEEDUP = 1.2;
export const STOP_PAUSE_SECONDS = 2.8;
const NO_TIME = 0;
const DEGREES_PER_HALF_TURN = 180;
/** How close a rail sample must come to a stop to count as reaching it. */
const STOP_TOLERANCE = 8;

function distance(a: TrackPoint, b: TrackPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Samples along a straight-line route, for styles without a rail such as the metro map. */
export function polylineSamples(points: readonly TrackPoint[]): RailSample[] {
  let length = 0;
  return points.map((point, index) => {
    length += index === 0 ? 0 : distance(points[index - 1], point);
    return { ...point, length };
  });
}

/**
 * Each stop's distance along the rail: the first time the rail reaches it after the stop before.
 * A loop leaves from and returns to its stop, so taking the first arrival puts the loop after the pause.
 */
export function stopLengths(samples: readonly RailSample[], stops: readonly TrackPoint[]): number[] {
  let from = 0;
  return stops.map((stop) => {
    let best = from;
    for (let index = from; index < samples.length; index += 1) {
      const gap = distance(samples[index], stop);
      if (gap <= STOP_TOLERANCE) {
        best = index;
        break;
      }
      if (gap < distance(samples[best], stop)) {
        best = index;
      }
    }
    from = best;
    return samples[best]?.length ?? 0;
  });
}

/** Where the cart is and which way it faces at a distance along the rail. */
export function poseAt(samples: readonly RailSample[], length: number): CartPose {
  const last = samples.length - 1;
  let index = 1;
  while (index < last && samples[index].length < length) {
    index += 1;
  }
  const before = samples[Math.max(index - 1, 0)];
  const after = samples[Math.min(index, last)];
  const span = after.length - before.length;
  const share = span > 0 ? Math.min(Math.max((length - before.length) / span, 0), 1) : 0;
  const angle = (Math.atan2(after.y - before.y, after.x - before.x) * DEGREES_PER_HALF_TURN) / Math.PI;
  return {
    x: before.x + (after.x - before.x) * share,
    y: before.y + (after.y - before.y) * share,
    angle: Number.isFinite(angle) ? angle : 0,
  };
}

/** Seconds to ride from one point to another: longer for a climb, shorter for a drop. Screen y grows downward. */
export function moveSeconds(railLength: number, from: TrackPoint, to: TrackPoint, trackHeight: number): number {
  const steepness = Math.min(Math.abs(to.y - from.y) / Math.max(trackHeight, 1), 1);
  const isClimb = to.y < from.y;
  const factor = isClimb ? 1 + CLIMB_SLOWDOWN * steepness : 1 / (1 + DROP_SPEEDUP * steepness);
  return Math.max(SHORTEST_MOVE_SECONDS, (railLength / LEVEL_SPEED) * factor);
}

/** Moves between stops with a pause at each, ending at the end of the rail. */
export function buildTimeline(
  samples: readonly RailSample[],
  stops: readonly TrackPoint[],
  settings: TimelineSettings,
): Timeline {
  const lengths = stopLengths(samples, stops);
  const railEnd = samples.at(-1)?.length ?? 0;
  const steps: TimelineStep[] = [];
  let clock = 0;
  let at = 0;
  const addMove = (to: number): void => {
    const duration = settings.isInstant
      ? NO_TIME
      : moveSeconds(to - at, poseAt(samples, at), poseAt(samples, to), settings.trackHeight);
    steps.push({ kind: "move", from: at, to, start: clock, duration });
    clock += duration;
    at = to;
  };
  lengths.forEach((length, stopIndex) => {
    addMove(length);
    steps.push({ kind: "pause", stopIndex, at: length, start: clock, duration: STOP_PAUSE_SECONDS });
    clock += STOP_PAUSE_SECONDS;
  });
  addMove(railEnd);
  return { steps, duration: clock };
}

/** Eases in and out, so the cart pulls away and arrives gently. */
function ease(share: number): number {
  return (1 - Math.cos(Math.PI * share)) / 2;
}

/** Where the ride is after a number of seconds. */
export function positionAt(timeline: Timeline, elapsed: number): PlaybackPosition {
  let stopIndex: number | null = null;
  for (const step of timeline.steps) {
    const end = step.start + step.duration;
    if (step.kind === "pause") {
      if (elapsed < step.start) {
        break;
      }
      stopIndex = step.stopIndex;
      if (elapsed < end) {
        return { length: step.at, stopIndex, isFinished: false };
      }
    } else if (elapsed < end) {
      const share = step.duration > 0 ? Math.max(elapsed - step.start, 0) / step.duration : 1;
      return { length: step.from + (step.to - step.from) * ease(share), stopIndex, isFinished: false };
    }
  }
  const lastStep = timeline.steps.at(-1);
  const length = lastStep?.kind === "move" ? lastStep.to : 0;
  return { length, stopIndex, isFinished: elapsed >= timeline.duration };
}

/** When the pause at a stop begins, for jumping straight to it. */
export function stopStartTime(timeline: Timeline, stopIndex: number): number {
  const pause = timeline.steps.find((step) => step.kind === "pause" && step.stopIndex === stopIndex);
  return pause?.start ?? NO_TIME;
}

/**
 * Where a cart is when the ride has reached an x, for carts that move through time side by side.
 * It follows a track's profile, which runs left to right, and parks at either end beyond it.
 */
export function poseAtX(profile: readonly TrackPoint[], x: number): CartPose {
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return { x, y: 0, angle: 0 };
  }
  if (x <= first.x) {
    return { ...first, angle: 0 };
  }
  const index = profile.findIndex((point) => point.x >= x);
  if (index === -1) {
    return { ...last, angle: 0 };
  }
  const before = profile[index - 1];
  const after = profile[index];
  const span = after.x - before.x;
  const share = span > 0 ? (x - before.x) / span : 0;
  const angle = (Math.atan2(after.y - before.y, after.x - before.x) * DEGREES_PER_HALF_TURN) / Math.PI;
  return { x, y: before.y + (after.y - before.y) * share, angle };
}
