/**
 * Pure timing and geometry for Ride it, the guided playback where the cart rides the track stop by stop.
 * It turns samples of the rail into each stop's distance along it, a timeline of moves and pauses, and the cart's
 * position and heading at any moment; climbs take longer than drops, loops are ridden on the way out of a stop, and the
 * cart pauses just short of each stop so it never hides the stop's marker, flag or label, unless the ride is non-stop,
 * when it rolls through every stop and only slows a little there. It holds no clock and
 * touches no DOM, so the browser hooks only measure the rail and ask it where the cart is.
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

export interface MoveEnds {
  start: number;
  end: number;
}

interface Move {
  kind: "move";
  from: number;
  to: number;
  start: number;
  duration: number;
  /** The cart's speed as the move begins and ends, as a share of its average speed: 0 is at rest. */
  ends: MoveEnds;
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
  /** Rolls through every stop without holding still: pauses take no time and the cart only slows a little at a stop. */
  isNonStop: boolean;
}

/** Cart speed on level track, in drawing pixels per second. */
const LEVEL_SPEED = 260;
const SHORTEST_MOVE_SECONDS = 0.6;
/** A climb across the whole height takes this much longer, and a drop as much shorter. */
const CLIMB_SLOWDOWN = 1.2;
const DROP_SPEEDUP = 1.2;
export const STOP_PAUSE_SECONDS = 2.8;
/** A non-stop ride still passes through each stop, but takes no time there. */
const NON_STOP_PAUSE_SECONDS = 0;
const AT_REST = 0;
/** A non-stop ride passes each stop at this share of its average speed, so it slows a little but never halts. */
export const NON_STOP_PASSING_SPEED = 0.6;
const RESTING_ENDS: MoveEnds = { start: AT_REST, end: AT_REST };
/** Coefficients of the cubic Hermite curve from 0 to 1 over a move, written for its start and end speeds. */
const HERMITE_TWO = 2;
const HERMITE_THREE = 3;
const NO_TIME = 0;
const DEGREES_PER_HALF_TURN = 180;
/** How close a rail sample must come to a stop to count as reaching it. */
const STOP_TOLERANCE = 8;
/**
 * How far along the rail before a stop the cart pauses: half the drawn cart (31 units at scale 1.25) plus room for
 * the stop's marker, so the cart's nose stops at the marker instead of covering it and the flag above.
 */
export const PAUSE_SHORT_OF_STOP = 52;

export interface RailAnchor {
  x: number;
  /** Distance along the rail where the rail reaches this x on the way to the next stop. */
  length: number;
}

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

/** A non-stop move pulls away from rest at the ride's start, comes to rest at its end, and rolls through each stop. */
function nonStopEnds(isFirst: boolean, isLast: boolean): MoveEnds {
  return { start: isFirst ? AT_REST : NON_STOP_PASSING_SPEED, end: isLast ? AT_REST : NON_STOP_PASSING_SPEED };
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
  /** Reduced motion keeps its pauses, since with instant moves they are the only time each stop is shown. */
  const isNonStop = settings.isNonStop && !settings.isInstant;
  const pauseSeconds = isNonStop ? NON_STOP_PAUSE_SECONDS : STOP_PAUSE_SECONDS;
  const addMove = (to: number, isLast: boolean): void => {
    const duration = settings.isInstant
      ? NO_TIME
      : moveSeconds(to - at, poseAt(samples, at), poseAt(samples, to), settings.trackHeight);
    const ends = isNonStop ? nonStopEnds(steps.length === 0, isLast) : RESTING_ENDS;
    steps.push({ kind: "move", from: at, to, start: clock, duration, ends });
    clock += duration;
    at = to;
  };
  lengths.forEach((length, stopIndex) => {
    const pauseAt = Math.max(length - PAUSE_SHORT_OF_STOP, at);
    addMove(pauseAt, false);
    steps.push({ kind: "pause", stopIndex, at: pauseAt, start: clock, duration: pauseSeconds });
    clock += pauseSeconds;
  });
  addMove(railEnd, true);
  return { steps, duration: clock };
}

/**
 * How far through a move the cart is at a share of its time. A move from rest to rest eases in and out on a cosine,
 * so the cart pulls away and arrives gently; otherwise a cubic curve starts and ends at the given speeds, as shares
 * of the average speed, which keeps it moving forward for any speeds from 0 to 1.
 */
export function ease(share: number, ends: MoveEnds): number {
  if (ends.start === AT_REST && ends.end === AT_REST) {
    return (1 - Math.cos(Math.PI * share)) / 2;
  }
  const cubic = ends.start + ends.end - HERMITE_TWO;
  const square = HERMITE_THREE - HERMITE_TWO * ends.start - ends.end;
  return ((cubic * share + square) * share + ends.start) * share;
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
      return { length: step.from + (step.to - step.from) * ease(share, step.ends), stopIndex, isFinished: false };
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
 * Points that tie x across the drawing to distance along the rail: the rail's start, each stop and the rail's end.
 * Between them distance grows evenly with x, so a cart driven by x still rides every loop that follows a stop.
 */
export function railAnchors(samples: readonly RailSample[], stops: readonly TrackPoint[]): RailAnchor[] {
  const first = samples[0];
  const last = samples.at(-1);
  if (first === undefined || last === undefined) {
    return [];
  }
  const lengths = stopLengths(samples, stops);
  const points = [
    { x: first.x, length: first.length },
    ...stops.map((stop, index) => ({ x: stop.x, length: lengths[index] })),
    { x: last.x, length: last.length },
  ];
  return points.filter((point, index) => index === 0 || point.x > points[index - 1].x);
}

/** Distance along the rail when a ride that moves through x has reached this x, held at either end. */
export function lengthAtX(anchors: readonly RailAnchor[], x: number): number {
  const first = anchors[0];
  const last = anchors.at(-1);
  if (first === undefined || last === undefined) {
    return 0;
  }
  if (x <= first.x) {
    return first.length;
  }
  const index = anchors.findIndex((anchor) => anchor.x >= x);
  if (index === -1) {
    return last.length;
  }
  const before = anchors[index - 1];
  const after = anchors[index];
  return before.length + ((after.length - before.length) * (x - before.x)) / (after.x - before.x);
}
