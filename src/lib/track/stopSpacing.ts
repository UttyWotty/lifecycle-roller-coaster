/**
 * Pure placement of stops along the ride, so the space between two stops follows the time between their dates.
 * Close dates sit closer than a style's normal spacing and long gaps sit further apart, on a log scale with clamped ends.
 * List order always decides the sequence: undated events and dates out of order keep the normal gap.
 */
import type { LifeEvent } from "@/lib/events/schema";
import type { TrackStop } from "./types";

/** The gap between two events in the same year, as a share of the normal spacing, unless a style asks for more. */
export const MIN_GAP_SHARE = 0.6;
/** The widest gap, so one long quiet stretch never pushes the rest of the ride off the screen. */
export const MAX_GAP_SHARE = 2;
/** Extra share added each time the years between two events double, so one year apart gives the normal gap. */
const SHARE_PER_DOUBLING = 0.4;
/** Share used when the time between two events is unknown or runs backwards. */
export const NORMAL_GAP_SHARE = 1;

const MONTHS_PER_YEAR = 12;
const DAYS_PER_MONTH = 31;
/** A date given without its month or day sits in the middle of the missing part. */
const MIDDLE = 0.5;
const DATE_SEPARATOR = "-";

/** Turns a YYYY, YYYY-MM or YYYY-MM-DD date into a fractional year for measuring gaps. */
export function dateToYears(date: string): number {
  const [year, month, day] = date.split(DATE_SEPARATOR).map(Number);
  if (month === undefined) {
    return year + MIDDLE;
  }
  const dayShare = day === undefined ? MIDDLE : (day - MIDDLE) / DAYS_PER_MONTH;
  return year + (month - 1 + dayShare) / MONTHS_PER_YEAR;
}

/**
 * Years from one date to the next, compared at the precision both share, so "2015" and "2015-03" count as
 * the same time rather than as out of order.
 */
export function yearsBetween(from: string, to: string): number {
  const fromParts = from.split(DATE_SEPARATOR);
  const toParts = to.split(DATE_SEPARATOR);
  const parts = Math.min(fromParts.length, toParts.length);
  const coarse = (dateParts: string[]): string => dateParts.slice(0, parts).join(DATE_SEPARATOR);
  return dateToYears(coarse(toParts)) - dateToYears(coarse(fromParts));
}

/** The gap between two neighbouring events as a share of the normal spacing, never below minShare. */
export function gapShare(from: LifeEvent, to: LifeEvent, minShare: number): number {
  if (from.date === null || to.date === null) {
    return NORMAL_GAP_SHARE;
  }
  const years = yearsBetween(from.date, to.date);
  if (years < 0) {
    return NORMAL_GAP_SHARE;
  }
  const share = MIN_GAP_SHARE + SHARE_PER_DOUBLING * Math.log2(1 + years);
  return Math.min(Math.max(share, minShare), MAX_GAP_SHARE);
}

export interface SpacingOptions {
  /** Where the first stop sits. */
  firstX: number;
  /** The style's normal distance between two stops. */
  spacing: number;
  /** The smallest gap as a share of the spacing, raised by styles that draw wide shapes at a stop. */
  minShare: number;
  /** The fewest pixels before each stop, from labelClearances; the first entry is unused. */
  clearances: readonly number[];
}

/** Space kept between two labels drawn side by side. */
const LABEL_GAP = 12;
/** A stop whose label cannot meet the one before it needs no extra room. */
const NO_CLEARANCE = 0;

export interface LabelPlacement {
  labelSide: TrackStop["labelSide"];
  labelWidth: number;
}

/**
 * The fewest pixels before each stop so its label never runs into the one before. Labels on opposite sides of
 * the rail cannot meet, so only neighbours on the same side need room; the first stop needs none.
 */
export function labelClearances(labels: readonly LabelPlacement[]): number[] {
  return labels.map((label, index) => {
    const previous = labels[index - 1];
    if (previous === undefined || previous.labelSide !== label.labelSide) {
      return NO_CLEARANCE;
    }
    return (previous.labelWidth + label.labelWidth) / 2 + LABEL_GAP;
  });
}

/** The x of every stop in list order, each one a time-based gap after the one before, and never closer than its label needs. */
export function stopPositions(events: readonly LifeEvent[], options: SpacingOptions): number[] {
  const positions: number[] = [];
  events.forEach((event, index) => {
    const previous = events[index - 1];
    const x =
      previous === undefined
        ? options.firstX
        : positions[index - 1] +
          Math.max(options.spacing * gapShare(previous, event, options.minShare), options.clearances[index] ?? NO_CLEARANCE);
    positions.push(x);
  });
  return positions;
}
