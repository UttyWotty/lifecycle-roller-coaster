/**
 * Pure generators that turn a list of life events into roller-coaster geometry.
 * Positive events raise the level by their impact, negative events lower it, and neutral events stay flat.
 * They return plain numbers and path data, and know nothing about AI, React or how events were made.
 */
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
import type { RideStyle, Track, TrackPoint, TrackStop } from "./types";

interface CoasterShape {
  style: RideStyle;
  stopSpacing: number;
  topMargin: number;
  height: number;
  /** How late a curve turns: 0.5 is a gentle slope, and higher values make sharper drops. */
  curveTension: number;
  hasLoops: boolean;
}

interface PathPoint extends TrackPoint {
  loopRadius: number;
}

export const TRACK_HEIGHT = 460;
export const MAJOR_IMPACT = 8;
export const MAX_LABEL_LENGTH = 22;

export const LOOP_TRACK_HEIGHT = 560;

const SIDE_PADDING = 110;
const BOTTOM_MARGIN = 90;
const BASE_LOOP_RADIUS = 46;
const LOOP_RADIUS_STEP = 10;
/** Control point distance that makes two cubic curves trace a true circle. */
const CIRCLE_CONTROL_RATIO = 4 / 3;
const NO_LOOP = 0;
const LEAD_OUT = 60;
const ELLIPSIS = "...";

const CLASSIC_SHAPE: CoasterShape = {
  style: "coaster",
  stopSpacing: 170,
  topMargin: 90,
  height: TRACK_HEIGHT,
  curveTension: 0.5,
  hasLoops: false,
};

/** The extra height and top margin leave room for the tallest loop at the highest stop. */
const LOOP_SHAPE: CoasterShape = {
  style: "loops",
  stopSpacing: 200,
  topMargin: 190,
  height: LOOP_TRACK_HEIGHT,
  curveTension: 0.8,
  hasLoops: true,
};

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

/** Fills in the fields shared by every style from an event and its place in the drawing. */
export function createStop(
  event: LifeEvent,
  placement: Pick<TrackStop, "x" | "y" | "level" | "labelSide">,
): TrackStop {
  return {
    ...placement,
    id: event.id,
    title: shortenLabel(event.title),
    date: event.date,
    category: event.category,
    sentiment: event.sentiment,
    impact: event.impact,
    isMajor: event.impact >= MAJOR_IMPACT,
  };
}

/** Bigger events get bigger loops, from the major threshold up to the largest impact. */
export function loopRadius(impact: number): number {
  return BASE_LOOP_RADIUS + (impact - MAJOR_IMPACT) * LOOP_RADIUS_STEP;
}

/** Maps a level to a height, placing a track with no change at the middle of the canvas. */
function createLevelScale(
  levels: readonly number[],
  top: number,
  bottom: number,
): (level: number) => number {
  const lowest = Math.min(...levels);
  const highest = Math.max(...levels);
  if (lowest === highest) {
    return () => (top + bottom) / 2;
  }
  return (level) => bottom - ((level - lowest) / (highest - lowest)) * (bottom - top);
}

/** Traces a full circle above a point, leaving and returning level so it joins the rail smoothly. */
function loopCurves({ x, y }: TrackPoint, radius: number): string {
  const reach = radius * CIRCLE_CONTROL_RATIO;
  const top = y - radius * 2;
  return (
    `C${x + reach} ${y} ${x + reach} ${top} ${x} ${top} ` +
    `C${x - reach} ${top} ${x - reach} ${y} ${x} ${y}`
  );
}

/** Joins points with curves that are level at each point, so every peak and valley looks smooth. */
function smoothPath(points: readonly PathPoint[], tension: number): string {
  const [first, ...rest] = points;
  const curves = rest.map((point, index) => {
    const previous = points[index];
    const reach = (point.x - previous.x) * tension;
    const curve = `C${previous.x + reach} ${previous.y} ${point.x - reach} ${point.y} ${point.x} ${point.y}`;
    return point.loopRadius > NO_LOOP ? `${curve} ${loopCurves(point, point.loopRadius)}` : curve;
  });
  return [`M${first.x} ${first.y}`, ...curves].join(" ");
}

function midpoints(points: readonly TrackPoint[]): TrackPoint[] {
  return points.slice(1).map((point, index) => ({
    x: (points[index].x + point.x) / 2,
    y: (points[index].y + point.y) / 2,
  }));
}

function buildCoaster(events: readonly LifeEvent[], shape: CoasterShape): Track {
  const levels = cumulativeLevels(events);
  const toY = createLevelScale([0, ...levels], shape.topMargin, shape.height - BOTTOM_MARGIN);
  const stops = events.map((event, index): TrackStop => {
    const isDrop = levels[index] < (levels[index - 1] ?? 0);
    const hasLoop = shape.hasLoops && event.impact >= MAJOR_IMPACT;
    return createStop(event, {
      x: SIDE_PADDING + index * shape.stopSpacing,
      y: toY(levels[index]),
      level: levels[index],
      labelSide: isDrop || hasLoop ? "below" : "above",
    });
  });
  const lastX = stops.at(-1)?.x ?? SIDE_PADDING;
  const start = { x: SIDE_PADDING - shape.stopSpacing / 2, y: toY(0) };
  const end = { x: lastX + LEAD_OUT, y: stops.at(-1)?.y ?? toY(0) };
  const stopPoints = stops.map((stop): PathPoint => ({
    x: stop.x,
    y: stop.y,
    loopRadius: shape.hasLoops && stop.isMajor ? loopRadius(stop.impact) : NO_LOOP,
  }));
  const points = [start, ...stops, end];
  const path = smoothPath(
    [{ ...start, loopRadius: NO_LOOP }, ...stopPoints, { ...end, loopRadius: NO_LOOP }],
    shape.curveTension,
  );
  return {
    style: shape.style,
    width: lastX + SIDE_PADDING,
    height: shape.height,
    groundY: shape.height,
    lines: [{ category: null, path, start }],
    stops,
    supports: [...stops, ...midpoints(points)],
    contentOffset: 0,
    title: null,
  };
}

export function buildTrack(events: readonly LifeEvent[]): Track {
  return buildCoaster(events, CLASSIC_SHAPE);
}

/** The same ride with loops at major events and sharper drops between stops. */
export function buildLoopTrack(events: readonly LifeEvent[]): Track {
  return buildCoaster(events, LOOP_SHAPE);
}
