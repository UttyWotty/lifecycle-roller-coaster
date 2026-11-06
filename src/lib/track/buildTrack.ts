/**
 * Pure generators that turn a list of life events into roller-coaster geometry.
 * Each event sits at a height set by its own points: positive above the middle, negative below, neutral unchanged.
 * The bigger the gap between two events, the steeper and sharper the move between them.
 */
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
import type { RideStyle, Track, TrackPoint, TrackStop } from "./types";

interface CoasterShape {
  style: RideStyle;
  stopSpacing: number;
  topMargin: number;
  height: number;
  /** How late the gentlest curve turns. Bigger moves add to this, up to SHARPNESS_GAIN more. */
  curveTension: number;
  hasLoops: boolean;
}

interface PathPoint extends TrackPoint {
  loopRadius: number;
}

export const TRACK_HEIGHT = 560;
export const MAJOR_IMPACT = 8;
export const MAX_LABEL_LENGTH = 22;

export const LOOP_TRACK_HEIGHT = 680;

const SIDE_PADDING = 110;
const BOTTOM_MARGIN = 90;
const BASE_LOOP_RADIUS = 46;
const LOOP_RADIUS_STEP = 10;
/** Control point distance that makes two cubic curves trace a true circle. */
const CIRCLE_CONTROL_RATIO = 4 / 3;
const NO_LOOP = 0;
/** Extra curve tension for a move across the whole canvas. */
const SHARPNESS_GAIN = 0.3;
/** Levels a track shows at least, so a small move always looks small. */
const MIN_LEVEL_SPAN = 10;
const PROFILE_STEPS = 12;
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
  curveTension: 0.65,
  hasLoops: true,
};

const SENTIMENT_DIRECTION: Readonly<Record<EventSentiment, number>> = {
  positive: 1,
  negative: -1,
  neutral: 0,
};

/** Gives each event the level of its own signed points, and a neutral event the level before it. */
export function eventLevels(events: readonly LifeEvent[]): number[] {
  let level = 0;
  return events.map((event) => {
    if (event.sentiment !== "neutral") {
      level = SENTIMENT_DIRECTION[event.sentiment] * event.impact;
    }
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
  const span = Math.max(highest - lowest, MIN_LEVEL_SPAN);
  return (level) => bottom - ((level - lowest) / span) * (bottom - top);
}

/** How far a curve holds its level before turning, which grows with the size of the move. */
function curveReach(from: TrackPoint, to: TrackPoint, shape: CoasterShape): number {
  const fullMove = shape.height - shape.topMargin - BOTTOM_MARGIN;
  const tension = shape.curveTension + (SHARPNESS_GAIN * Math.abs(to.y - from.y)) / fullMove;
  return (to.x - from.x) * tension;
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
function smoothPath(points: readonly PathPoint[], shape: CoasterShape): string {
  const [first, ...rest] = points;
  const curves = rest.map((point, index) => {
    const previous = points[index];
    const reach = curveReach(previous, point, shape);
    const curve = `C${previous.x + reach} ${previous.y} ${point.x - reach} ${point.y} ${point.x} ${point.y}`;
    return point.loopRadius > NO_LOOP ? `${curve} ${loopCurves(point, point.loopRadius)}` : curve;
  });
  return [`M${first.x} ${first.y}`, ...curves].join(" ");
}

/** Traces the same curves as smoothPath as a list of points, leaving out loops. */
function sampleProfile(points: readonly TrackPoint[], shape: CoasterShape): TrackPoint[] {
  const samples = points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    const reach = curveReach(previous, point, shape);
    return Array.from({ length: PROFILE_STEPS }, (_, step) => {
      const t = (step + 1) / PROFILE_STEPS;
      const u = 1 - t;
      const startShare = u ** 3 + 3 * u ** 2 * t;
      const endShare = 3 * u * t ** 2 + t ** 3;
      const x =
        u ** 3 * previous.x +
        3 * u ** 2 * t * (previous.x + reach) +
        3 * u * t ** 2 * (point.x - reach) +
        t ** 3 * point.x;
      return { x, y: startShare * previous.y + endShare * point.y };
    });
  });
  return [points[0], ...samples];
}

function midpoints(points: readonly TrackPoint[]): TrackPoint[] {
  return points.slice(1).map((point, index) => ({
    x: (points[index].x + point.x) / 2,
    y: (points[index].y + point.y) / 2,
  }));
}

function buildCoaster(events: readonly LifeEvent[], shape: CoasterShape): Track {
  const levels = eventLevels(events);
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
    shape,
  );
  return {
    style: shape.style,
    width: lastX + SIDE_PADDING,
    height: shape.height,
    groundY: shape.height,
    lines: [{ category: null, path, start }],
    stops,
    supports: [...stops, ...midpoints(points)],
    profile: sampleProfile(points, shape),
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
