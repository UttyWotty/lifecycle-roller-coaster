/**
 * Pure generator that turns a list of life events into roller-coaster geometry.
 * Positive events raise the level by their impact, negative events lower it, and neutral events stay flat.
 * It returns plain numbers and path data, and knows nothing about AI, React or how events were made.
 */
import type { EventCategory, EventSentiment, LifeEvent } from "@/lib/events/schema";

export interface TrackStop {
  id: string;
  x: number;
  y: number;
  level: number;
  title: string;
  date: string | null;
  category: EventCategory;
  sentiment: EventSentiment;
  impact: number;
  isMajor: boolean;
  labelSide: "above" | "below";
}

export interface TrackSupport {
  x: number;
  y: number;
}

export interface Track {
  width: number;
  height: number;
  groundY: number;
  path: string;
  stops: TrackStop[];
  supports: TrackSupport[];
}

export const TRACK_HEIGHT = 460;
export const MAJOR_IMPACT = 8;
export const MAX_LABEL_LENGTH = 22;

const STOP_SPACING = 170;
const SIDE_PADDING = 110;
const TOP_MARGIN = 90;
const BOTTOM_MARGIN = 90;
const LEAD_OUT = 60;
const ELLIPSIS = "...";

const SENTIMENT_DIRECTION: Readonly<Record<EventSentiment, number>> = {
  positive: 1,
  negative: -1,
  neutral: 0,
};

/** Adds up each event's signed impact, returning the level after every event. */
export function cumulativeLevels(events: readonly LifeEvent[]): number[] {
  let level = 0;
  return events.map((event) => {
    level += SENTIMENT_DIRECTION[event.sentiment] * event.impact;
    return level;
  });
}

export function shortenLabel(title: string): string {
  if (title.length <= MAX_LABEL_LENGTH) {
    return title;
  }
  return `${title.slice(0, MAX_LABEL_LENGTH - ELLIPSIS.length).trimEnd()}${ELLIPSIS}`;
}

/** Maps a level to a height, placing a track with no change at the middle of the canvas. */
function createLevelScale(levels: readonly number[]): (level: number) => number {
  const lowest = Math.min(...levels);
  const highest = Math.max(...levels);
  const top = TOP_MARGIN;
  const bottom = TRACK_HEIGHT - BOTTOM_MARGIN;
  if (lowest === highest) {
    return () => (top + bottom) / 2;
  }
  return (level) => bottom - ((level - lowest) / (highest - lowest)) * (bottom - top);
}

/** Joins points with curves that are level at each point, so every peak and valley looks smooth. */
function smoothPath(points: readonly TrackSupport[]): string {
  const [first, ...rest] = points;
  const curves = rest.map((point, index) => {
    const previous = points[index];
    const middleX = (previous.x + point.x) / 2;
    return `C${middleX} ${previous.y} ${middleX} ${point.y} ${point.x} ${point.y}`;
  });
  return [`M${first.x} ${first.y}`, ...curves].join(" ");
}

function midpoints(points: readonly TrackSupport[]): TrackSupport[] {
  return points.slice(1).map((point, index) => ({
    x: (points[index].x + point.x) / 2,
    y: (points[index].y + point.y) / 2,
  }));
}

export function buildTrack(events: readonly LifeEvent[]): Track {
  const levels = cumulativeLevels(events);
  const toY = createLevelScale([0, ...levels]);
  const stops = events.map((event, index): TrackStop => {
    const previousLevel = levels[index - 1] ?? 0;
    return {
      id: event.id,
      x: SIDE_PADDING + index * STOP_SPACING,
      y: toY(levels[index]),
      level: levels[index],
      title: shortenLabel(event.title),
      date: event.date,
      category: event.category,
      sentiment: event.sentiment,
      impact: event.impact,
      isMajor: event.impact >= MAJOR_IMPACT,
      labelSide: levels[index] < previousLevel ? "below" : "above",
    };
  });
  const lastX = stops.at(-1)?.x ?? SIDE_PADDING;
  const start = { x: SIDE_PADDING - STOP_SPACING / 2, y: toY(0) };
  const end = { x: lastX + LEAD_OUT, y: stops.at(-1)?.y ?? toY(0) };
  const points = [start, ...stops, end];
  return {
    width: lastX + SIDE_PADDING,
    height: TRACK_HEIGHT,
    groundY: TRACK_HEIGHT,
    path: smoothPath(points),
    stops,
    supports: [...stops, ...midpoints(points)],
  };
}
