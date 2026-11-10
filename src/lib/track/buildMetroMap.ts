/**
 * Pure generator that draws a life as a metro map, with one line for each event category.
 * Every line runs the full width, stops sit on their own line, and all lines meet at major events.
 * Sentiment and impact shift a stop up or down from its line, so edits still reshape the map.
 */
import type { EventCategory, LifeEvent } from "@/lib/events/schema";
import { createStop, eventLevels, labelPlacements } from "./buildTrack";
import { labelClearances, MIN_GAP_SHARE, stopPositions } from "./stopSpacing";
import type { Track, TrackLine, TrackPoint, TrackStop } from "./types";

/** Wider than the coaster, so lines have room to reach each other without steep angles. */
const STOP_SPACING = 220;
/** Wide enough for each line's name, and for lines to fan in towards a big first stop. */
const SIDE_PADDING = 280;
const LEAD = 140;
const TOP_MARGIN = 100;
const BOTTOM_MARGIN = 100;
const LANE_GAP = 90;
const IMPACT_SHIFT = 3;
/** Lines that meet run side by side at this gap, so one never hides another. */
const BUNDLE_GAP = 7;
/** Keeps the whole bundle inside a major station marker, however many lines there are. */
const MAX_BUNDLE_WIDTH = 30;
/** Points at least this far apart are separated by a return to the line's own lane. */
const LANE_RETURN_DISTANCE = STOP_SPACING * 2;

const SENTIMENT_SHIFT: Readonly<Record<LifeEvent["sentiment"], number>> = {
  positive: -1,
  negative: 1,
  neutral: 0,
};

/** One straight diagonal between level runs, in the style of a printed metro map. */
function metroSegment(from: TrackPoint, to: TrackPoint): string {
  const middle = (from.x + to.x) / 2;
  const halfRun = Math.min(to.x - from.x, Math.abs(to.y - from.y)) / 2;
  return `L${middle - halfRun} ${from.y} L${middle + halfRun} ${to.y} L${to.x} ${to.y}`;
}

function metroPath(points: readonly TrackPoint[]): string {
  const [first, ...rest] = points;
  const segments = rest.map((point, index) => metroSegment(points[index], point));
  return [`M${first.x} ${first.y}`, ...segments].join(" ");
}

/** Spreads lines back out between distant stops, so they pinch together only at big moments. */
function returnToLane(points: readonly TrackPoint[], laneY: number): TrackPoint[] {
  return points.flatMap((point, index) => {
    const next = points[index + 1];
    if (next === undefined || next.x - point.x < LANE_RETURN_DISTANCE) {
      return [point];
    }
    return [point, { x: (point.x + next.x) / 2, y: laneY }];
  });
}

function buildLine(
  category: EventCategory,
  laneIndex: number,
  laneCount: number,
  stops: readonly TrackStop[],
): TrackLine {
  const laneY = TOP_MARGIN + laneIndex * LANE_GAP;
  const gap = Math.min(BUNDLE_GAP, MAX_BUNDLE_WIDTH / Math.max(laneCount - 1, 1));
  const bundleOffset = (laneIndex - (laneCount - 1) / 2) * gap;
  const waypoints = stops
    .filter((stop) => stop.category === category || stop.isMajor)
    .map(({ x, y, isMajor }) => ({ x, y: isMajor ? y + bundleOffset : y }));
  const start = { x: SIDE_PADDING - LEAD, y: laneY };
  const end = { x: (stops.at(-1)?.x ?? SIDE_PADDING) + LEAD, y: laneY };
  return { category, path: metroPath(returnToLane([start, ...waypoints, end], laneY)), start };
}

export function buildMetroMap(events: readonly LifeEvent[]): Track {
  const levels = eventLevels(events);
  const categories = [...new Set(events.map((event) => event.category))];
  const sides = events.map((event): TrackStop["labelSide"] => (event.sentiment === "negative" ? "below" : "above"));
  const xs = stopPositions(events, {
    firstX: SIDE_PADDING,
    spacing: STOP_SPACING,
    minShare: MIN_GAP_SHARE,
    clearances: labelClearances(labelPlacements(events, sides)),
  });
  const stops = events.map((event, index) =>
    createStop(event, {
      x: xs[index],
      y:
        TOP_MARGIN +
        categories.indexOf(event.category) * LANE_GAP +
        SENTIMENT_SHIFT[event.sentiment] * event.impact * IMPACT_SHIFT,
      level: levels[index],
      labelSide: sides[index],
    }),
  );
  const height = TOP_MARGIN + Math.max(categories.length - 1, 0) * LANE_GAP + BOTTOM_MARGIN;
  return {
    style: "metro",
    width: (stops.at(-1)?.x ?? SIDE_PADDING) + SIDE_PADDING,
    height,
    groundY: height,
    lines: categories.map((category, index) => buildLine(category, index, categories.length, stops)),
    stops,
    supports: [],
    profile: [],
    contentOffset: 0,
    title: null,
    chapterBands: [],
    railSegments: [],
    future: null,
  };
}
