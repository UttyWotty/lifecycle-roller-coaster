/**
 * Pure geometry of the label pill, flag pole and marker drawn at each stop of an illustrated ride.
 * The drawing components and the scenery planner both read it, so decorations can keep clear of labels.
 * It has no behaviour beyond arithmetic on a stop's position, title and date.
 */
import type { TrackStop } from "@/lib/track/types";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LabelOptions {
  /** Metro stations have no flag, so their pill sits right above the marker. */
  isStation: boolean;
  /** Minimal Mode draws bare text without a flag. */
  isBare: boolean;
}

export const MARKER_RADIUS = 9;
export const MAJOR_MARKER_RADIUS = 15;
export const POLE_HEIGHT = 34;
export const TALL_POLE_HEIGHT = 84;
export const PILL_HEIGHT = 44;
export const PILL_GAP = 14;
const PILL_PADDING = 14;
const CHARACTER_WIDTH = 7;
/** Shown in place of a missing date, on the ride and in the label size estimate. */
export const UNKNOWN_DATE = "Date unknown";

export function markerRadius(stop: TrackStop): number {
  return stop.isMajor ? MAJOR_MARKER_RADIUS : MARKER_RADIUS;
}

/** Poles alternate between two heights, and the last one is tall, so neighbouring labels sit clear of each other. */
export function isTallStop(index: number, count: number): boolean {
  return index % 2 === 0 || index === count - 1;
}

export function pillWidth(title: string, date: string): number {
  return Math.max(title.length, date.length) * CHARACTER_WIDTH + PILL_PADDING * 2;
}

export function hasFlag(stop: TrackStop, options: LabelOptions): boolean {
  return stop.labelSide === "above" && !options.isStation && !options.isBare;
}

/** The top edge of a stop's label pill, below the marker for drops and above the flag for rises. */
export function pillTop(stop: TrackStop, isTall: boolean, options: LabelOptions): number {
  const radius = markerRadius(stop);
  if (stop.labelSide === "below") {
    return stop.y + radius + PILL_GAP;
  }
  if (hasFlag(stop, options)) {
    const poleTop = stop.y - (isTall ? TALL_POLE_HEIGHT : POLE_HEIGHT);
    return poleTop - PILL_HEIGHT - PILL_GAP / 2;
  }
  return stop.y - radius - PILL_GAP - PILL_HEIGHT;
}

/** The area a stop's pill, flag and marker cover, used to keep decorations off them. */
export function labelBox(stop: TrackStop, isTall: boolean, options: LabelOptions): Box {
  const width = pillWidth(stop.title, stop.date ?? UNKNOWN_DATE);
  const top = pillTop(stop, isTall, options);
  const radius = markerRadius(stop);
  const y = Math.min(top, stop.y - radius);
  const bottom = Math.max(top + PILL_HEIGHT, stop.y + radius);
  return { x: stop.x - width / 2, y, width, height: bottom - y };
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
