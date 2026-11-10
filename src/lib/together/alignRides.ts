/**
 * Pure layout that lines two to four rides up on one timeline, so the same year sits at the same place in every ride.
 * It merges the event lists into shared columns, keeping each list's own order, then spaces the columns by the
 * time between them and widens any gap that would let one ride's neighbouring labels run into each other.
 * The result gives each ride its stop positions and all rides one common width.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { labelWidth } from "@/lib/track/labelWidth";
import { shortenLabel } from "@/lib/track/buildTrack";
import { dateGapShare, yearsBetween } from "@/lib/track/stopSpacing";

export interface TogetherColumn {
  x: number;
  /** For each ride, the index of its event in this column, or null when it has none here. */
  entries: (number | null)[];
  date: string | null;
}

export interface AlignedRides {
  columns: TogetherColumn[];
  /** Each ride's stop positions, in its own event order. */
  positions: number[][];
  /** The end of the last column; each drawing is made at least this wide plus its own lead-out. */
  lastX: number;
}

export interface AlignOptions {
  firstX: number;
  spacing: number;
  minShare: number;
}

/** Room between two labels of the same ride side by side. Labels sit above or below, so this is generous. */
const LABEL_GAP = 16;
/** A moment counts as shared when at least this many people have one in the same column. */
const SHARED_PEOPLE = 2;

type MergedColumn = Omit<TogetherColumn, "x">;

function only(count: number, ride: number, index: number, date: string | null): MergedColumn {
  return { entries: Array.from({ length: count }, (_, side) => (side === ride ? index : null)), date };
}

/** The ride whose next dated event comes first, or null when none has a dated event next. */
function earliest(nexts: readonly (LifeEvent | undefined)[]): number | null {
  let best: number | null = null;
  nexts.forEach((next, ride) => {
    const bestDate = best === null ? null : (nexts[best]?.date ?? null);
    if (next?.date != null && (bestDate === null || yearsBetween(bestDate, next.date) < 0)) {
      best = ride;
    }
  });
  return best;
}

/**
 * Walks every list at once. Dated events of the same time at their shared precision share a column; otherwise the
 * earliest goes first. An undated event goes straight after the event before it in its own list.
 */
export function mergeColumns(lists: readonly (readonly LifeEvent[])[]): MergedColumn[] {
  const columns: MergedColumn[] = [];
  const next = lists.map(() => 0);
  while (lists.some((list, ride) => next[ride] < list.length)) {
    const nexts = lists.map((list, ride) => list[next[ride]]);
    const undated = nexts.findIndex((event) => event !== undefined && event.date === null);
    if (undated !== -1) {
      columns.push(only(lists.length, undated, next[undated], null));
      next[undated] += 1;
      continue;
    }
    const first = earliest(nexts);
    const date = first === null ? null : (nexts[first]?.date ?? null);
    if (first === null || date === null) {
      break;
    }
    const entries = nexts.map((event, ride) => (event?.date != null && yearsBetween(date, event.date) === 0 ? next[ride] : null));
    entries.forEach((entry, ride) => {
      if (entry !== null) {
        next[ride] += 1;
      }
    });
    columns.push({ entries, date });
  }
  return columns;
}

function widthOf(event: LifeEvent): number {
  return labelWidth(shortenLabel(event.title), event.date);
}

/** Places merged columns along the timeline. */
function placeColumns(merged: readonly MergedColumn[], lists: readonly (readonly LifeEvent[])[], options: AlignOptions): number[] {
  const xs: number[] = [];
  const lastSeen: ({ x: number; width: number } | null)[] = lists.map(() => null);
  merged.forEach((current, index) => {
    const previous = merged[index - 1];
    let x =
      previous === undefined
        ? options.firstX
        : xs[index - 1] + options.spacing * dateGapShare(previous.date, current.date, options.minShare);
    current.entries.forEach((entry, ride) => {
      const seen = lastSeen[ride];
      if (entry !== null && seen !== null) {
        x = Math.max(x, seen.x + (seen.width + widthOf(lists[ride][entry])) / 2 + LABEL_GAP);
      }
    });
    x = Math.round(x);
    xs.push(x);
    current.entries.forEach((entry, ride) => {
      if (entry !== null) {
        lastSeen[ride] = { x, width: widthOf(lists[ride][entry]) };
      }
    });
  });
  return xs;
}

export function alignRides(lists: readonly (readonly LifeEvent[])[], options: AlignOptions): AlignedRides {
  const merged = mergeColumns(lists);
  const xs = placeColumns(merged, lists, options);
  const columns = merged.map((entry, index) => ({ ...entry, x: xs[index] }));
  const positions = lists.map((_, ride) => columns.flatMap((column) => (column.entries[ride] === null ? [] : [column.x])));
  return { columns, positions, lastX: xs.at(-1) ?? options.firstX };
}

/** Columns where at least two people have a moment: the same year, more than one story. */
export function sharedMoments(columns: readonly TogetherColumn[]): TogetherColumn[] {
  return columns.filter((column) => column.entries.filter((entry) => entry !== null).length >= SHARED_PEOPLE);
}
