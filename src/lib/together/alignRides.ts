/**
 * Pure layout that lines two rides up on one timeline, so the same year sits at the same place in both.
 * It merges the two event lists into shared columns, keeping each list's own order, then spaces the columns by the
 * time between them and widens any gap that would let one ride's neighbouring labels run into each other.
 * The result gives each ride its stop positions and both rides one common width.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { labelWidth } from "@/lib/track/labelWidth";
import { shortenLabel } from "@/lib/track/buildTrack";
import { dateGapShare, yearsBetween } from "@/lib/track/stopSpacing";

export type RideSide = "a" | "b";

export interface TogetherColumn {
  x: number;
  /** Index of the first ride's event in this column, or null when it has none here. */
  a: number | null;
  b: number | null;
  date: string | null;
}

export interface AlignedRides {
  columns: TogetherColumn[];
  positionsA: number[];
  positionsB: number[];
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

type MergedColumn = Omit<TogetherColumn, "x">;

function column(a: number | null, b: number | null, date: string | null): MergedColumn {
  return { a, b, date };
}

/**
 * Walks both lists at once. Two dated events of the same time at their shared precision share a column; otherwise the
 * earlier one goes first. An undated event goes straight after the event before it in its own list.
 */
export function mergeColumns(a: readonly LifeEvent[], b: readonly LifeEvent[]): MergedColumn[] {
  const columns: MergedColumn[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    const nextA = a[i];
    const nextB = b[j];
    if (nextB === undefined || (nextA !== undefined && nextA.date === null)) {
      columns.push(column(i, null, nextA.date));
      i += 1;
    } else if (nextA === undefined || nextB.date === null) {
      columns.push(column(null, j, nextB.date));
      j += 1;
    } else if (nextA.date !== null) {
      const years = yearsBetween(nextA.date, nextB.date);
      if (years === 0) {
        columns.push(column(i, j, nextA.date));
        i += 1;
        j += 1;
      } else if (years > 0) {
        columns.push(column(i, null, nextA.date));
        i += 1;
      } else {
        columns.push(column(null, j, nextB.date));
        j += 1;
      }
    }
  }
  return columns;
}

function widthOf(event: LifeEvent): number {
  return labelWidth(shortenLabel(event.title), event.date);
}

/** Places merged columns along the timeline. */
function placeColumns(
  merged: readonly MergedColumn[],
  a: readonly LifeEvent[],
  b: readonly LifeEvent[],
  options: AlignOptions,
): number[] {
  const xs: number[] = [];
  const lastSeen: Record<RideSide, { x: number; width: number } | null> = { a: null, b: null };
  merged.forEach((current, index) => {
    const previous = merged[index - 1];
    let x =
      previous === undefined
        ? options.firstX
        : xs[index - 1] + options.spacing * dateGapShare(previous.date, current.date, options.minShare);
    for (const [side, events, eventIndex] of [
      ["a", a, current.a],
      ["b", b, current.b],
    ] as const) {
      const seen = lastSeen[side];
      if (eventIndex !== null && seen !== null) {
        x = Math.max(x, seen.x + (seen.width + widthOf(events[eventIndex])) / 2 + LABEL_GAP);
      }
    }
    x = Math.round(x);
    xs.push(x);
    if (current.a !== null) {
      lastSeen.a = { x, width: widthOf(a[current.a]) };
    }
    if (current.b !== null) {
      lastSeen.b = { x, width: widthOf(b[current.b]) };
    }
  });
  return xs;
}

export function alignRides(a: readonly LifeEvent[], b: readonly LifeEvent[], options: AlignOptions): AlignedRides {
  const merged = mergeColumns(a, b);
  const xs = placeColumns(merged, a, b, options);
  const columns = merged.map((entry, index) => ({ ...entry, x: xs[index] }));
  const positionsA: number[] = [];
  const positionsB: number[] = [];
  for (const entry of columns) {
    if (entry.a !== null) {
      positionsA.push(entry.x);
    }
    if (entry.b !== null) {
      positionsB.push(entry.x);
    }
  }
  return { columns, positionsA, positionsB, lastX: xs.at(-1) ?? options.firstX };
}

/** Columns where both people have a moment: the same year, two stories. */
export function sharedMoments(columns: readonly TogetherColumn[]): TogetherColumn[] {
  return columns.filter((entry) => entry.a !== null && entry.b !== null);
}
