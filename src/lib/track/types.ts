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

export interface Track {
  style: RideStyle;
  width: number;
  height: number;
  groundY: number;
  lines: TrackLine[];
  stops: TrackStop[];
  supports: TrackPoint[];
  /** How far the ride sits below the top of the canvas, to leave room for a title. */
  contentOffset: number;
  title: TrackTitle | null;
}
