/**
 * Pure rules for stops that have not happened yet: which dates are in the future, and where a ride's future begins.
 * The future is the run of stops at the end of the ride dated after today, with any undated stops among or after them,
 * so the user's order is kept.
 * It cuts the rail exactly at today, halfway to the first stop to come, so the cart parks on the rail there.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { segmentPath } from "./buildTrack";
import type { RailSegment, Track, TrackPoint } from "./types";

const MONTH_DIGITS = 2;
const DAY_DIGITS = 2;
const HALF = 2;
const EIGHTH = 8;
const CONTROL_WEIGHT = 3;
const DRAWING_LEFT = 0;

/** Today as YYYY-MM-DD in the user's own time zone. */
export function todayString(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(MONTH_DIGITS, "0");
  const day = String(now.getDate()).padStart(DAY_DIGITS, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Whether a date is still to come. A date is compared at its own precision, so "2026" in 2026 has happened,
 * and an unknown date never counts as the future.
 */
export function isFutureDate(date: string | null, today: string): boolean {
  return date !== null && date > today.slice(0, date.length);
}

/**
 * The index where the future begins: the first future-dated stop of the run at the end made of future-dated and
 * undated stops. An undated stop after a future one is still to come too, so it joins the future instead of hiding it.
 * Null when that run holds no future-dated stop.
 */
export function futureFromIndex(events: readonly LifeEvent[], today: string): number | null {
  let from = events.length;
  while (from > 0 && (events[from - 1].date === null || isFutureDate(events[from - 1].date, today))) {
    from -= 1;
  }
  while (from < events.length && events[from].date === null) {
    from += 1;
  }
  return from < events.length ? from : null;
}

/** Events that have happened, and those still to come, for anything that should count only what happened. */
export function splitFuture(events: readonly LifeEvent[], today: string): { past: LifeEvent[]; future: LifeEvent[] } {
  const from = futureFromIndex(events, today) ?? events.length;
  const isToCome = (event: LifeEvent, index: number): boolean => index >= from || isFutureDate(event.date, today);
  return {
    past: events.filter((event, index) => !isToCome(event, index)),
    future: events.filter((event, index) => isToCome(event, index)),
  };
}

function midpoint(a: TrackPoint, b: TrackPoint): TrackPoint {
  return { x: (a.x + b.x) / HALF, y: (a.y + b.y) / HALF };
}

/** The first half of a rail segment, which ends exactly halfway across it. */
function firstHalf({ start, control1, control2, end }: RailSegment): RailSegment {
  const middle = {
    x: (start.x + CONTROL_WEIGHT * control1.x + CONTROL_WEIGHT * control2.x + end.x) / EIGHTH,
    y: (start.y + CONTROL_WEIGHT * control1.y + CONTROL_WEIGHT * control2.y + end.y) / EIGHTH,
  };
  const between = midpoint(control1, control2);
  const near = midpoint(start, control1);
  return { start, control1: near, control2: midpoint(near, between), end: middle, loop: "" };
}

function railToToday(segments: readonly RailSegment[], fromIndex: number): { path: string; end: TrackPoint } | null {
  const cut = segments[fromIndex];
  if (cut === undefined) {
    return null;
  }
  const half = firstHalf(cut);
  const pieces = [...segments.slice(0, fromIndex), half].map(segmentPath);
  return { path: [`M${segments[0].start.x} ${segments[0].start.y}`, ...pieces].join(" "), end: half.end };
}

/** Where today falls on a ride without a rail: halfway between the last stop that happened and the first to come. */
function todayWithoutRail(track: Track, fromIndex: number): TrackPoint {
  const next = track.stops[fromIndex];
  const previous = track.stops[fromIndex - 1] ?? { x: DRAWING_LEFT, y: next.y };
  return midpoint(previous, next);
}

/** Marks where a ride's future begins, from the events it was drawn from and today's date. */
export function addFuture(track: Track, events: readonly LifeEvent[], today: string): Track {
  const fromIndex = futureFromIndex(events, today);
  if (fromIndex === null || fromIndex >= track.stops.length) {
    return { ...track, future: null };
  }
  const rail = railToToday(track.railSegments, fromIndex);
  const parkAt = rail?.end ?? todayWithoutRail(track, fromIndex);
  return { ...track, future: { fromIndex, x: parkAt.x, pastRail: rail?.path ?? null, parkAt } };
}

/** The stops a ride has reached by today, which Ride it rides through. */
export function pastStops(track: Track): Track["stops"] {
  return track.future === null ? track.stops : track.stops.slice(0, track.future.fromIndex);
}
