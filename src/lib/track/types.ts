/**
 * Shared geometry types for every ride style, and the list of styles itself.
 * Each generator returns a Track, so one drawing component and one export path serve them all.
 * This module holds types and data only and has no behaviour.
 */
import type { EventCategory, EventSentiment } from "@/lib/events/schema";

export const RIDE_STYLES = ["coaster", "loops", "metro"] as const;
export type RideStyle = (typeof RIDE_STYLES)[number];

export interface TrackPoint {
  x: number;
  y: number;
}

export interface TrackStop extends TrackPoint {
  id: string;
  level: number;
  title: string;
  date: string | null;
  category: EventCategory;
  sentiment: EventSentiment;
  impact: number;
  isMajor: boolean;
  labelSide: "above" | "below";
}

export interface TrackLine {
  /** Null means the single coaster rail. A category means a metro line in that category's colour. */
  category: EventCategory | null;
  path: string;
  start: TrackPoint;
}

export interface TrackTitle {
  text: string;
  fontSize: number;
  x: number;
  y: number;
}

export interface ChapterBand {
  title: string;
  start: number;
  end: number;
}

export interface Track {
  style: RideStyle;
  width: number;
  height: number;
  groundY: number;
  lines: TrackLine[];
  stops: TrackStop[];
  supports: TrackPoint[];
  /** The rail's height along its length, without loops, for drawing what holds it up. */
  profile: TrackPoint[];
  /** How far the ride sits below the top of the canvas, to leave room for a title. */
  contentOffset: number;
  title: TrackTitle | null;
  /** Named spans along the bottom of the ride, empty when there are no chapters. */
  chapterBands: ChapterBand[];
  /** The rail as one curve per stop and one to the end, so it can be cut at any stop; empty without a rail. */
  railSegments: RailSegment[];
  /** Where the stops still to come begin, or null when every stop has happened. */
  future: TrackFuture | null;
}

/**
 * One cubic curve of the rail, ending at a stop or at the rail's end, with the loop that follows that stop.
 * Its control points sit level with its ends at mirrored distances, so its middle is exactly halfway across.
 */
export interface RailSegment {
  start: TrackPoint;
  control1: TrackPoint;
  control2: TrackPoint;
  end: TrackPoint;
  /** Path commands for the loop ridden after the end point, or empty. */
  loop: string;
}

/** The stretch of a ride that has not happened yet: from a stop index to the end, beginning at a "today" line. */
export interface TrackFuture {
  fromIndex: number;
  /** Where today is across the drawing, halfway between the last stop that happened and the first to come. */
  x: number;
  /** The rail from its start to today, for the cart, or null for styles without a rail. */
  pastRail: string | null;
  /** Where the cart parks at today. */
  parkAt: TrackPoint;
}

/**
 * Stop positions decided outside a generator, such as two rides lined up on one timeline.
 * The generator uses these x values for its stops and makes the track at least this wide.
 */
export interface StopLayout {
  positions: readonly number[];
  minWidth: number;
}
