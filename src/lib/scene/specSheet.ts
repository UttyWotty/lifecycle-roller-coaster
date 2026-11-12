/**
 * Pure facts and layout for the Track map look's spec sheet, the strip of ride facts printed under the line.
 * Facts come from the drawn stops only: years spanned, number of stops, the highest and lowest stop and the big moves.
 * Each cell is centred under a stop with room on both sides, so a story picture row cut never splits a cell.
 */
import type { TrackStop } from "@/lib/track/types";
import { BIG_MOVE } from "./bigMoves";

export type SpecFact = "years" | "stops" | "highest" | "lowest" | "bigMoves";

export interface SpecCell {
  fact: SpecFact;
  x: number;
  value: string;
}

/** Facts in order of importance, so the most useful ones get a cell first when stops are few or close. */
export const SPEC_FACTS: readonly SpecFact[] = ["years", "stops", "highest", "lowest", "bigMoves"];
/** Half a cell's width; a stop needs this much room to each neighbour's halfway point to hold one. */
export const CELL_HALF_WIDTH = 64;
/** Longer stop titles are cut to this many characters, with an ellipsis. */
export const VALUE_MAX_LENGTH = 14;
const YEAR_LENGTH = 4;
const ELLIPSIS = "…";
const YEAR_DASH = "–";
const HALF = 2;

function shortened(text: string): string {
  return text.length > VALUE_MAX_LENGTH ? `${text.slice(0, VALUE_MAX_LENGTH - 1).trimEnd()}${ELLIPSIS}` : text;
}

function yearsValue(stops: readonly TrackStop[]): string | null {
  const years = stops.flatMap(({ date }) => (date ? [Number(date.slice(0, YEAR_LENGTH))] : []));
  if (years.length === 0) {
    return null;
  }
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? `${first}` : `${first}${YEAR_DASH}${last}`;
}

function extremeTitle(stops: readonly TrackStop[], pick: (a: number, b: number) => boolean): string | null {
  const best = stops.reduce<TrackStop | null>((chosen, stop) => (chosen === null || pick(stop.level, chosen.level) ? stop : chosen), null);
  return best ? shortened(best.title) : null;
}

function bigMoveCount(stops: readonly TrackStop[]): number {
  return stops.slice(1).filter((stop, index) => Math.abs(stop.level - stops[index].level) >= BIG_MOVE).length;
}

/** The value printed for each fact, or null when a ride has nothing to say for it. */
export function specValues(stops: readonly TrackStop[]): Readonly<Record<SpecFact, string | null>> {
  return {
    years: yearsValue(stops),
    stops: stops.length > 0 ? `${stops.length}` : null,
    highest: extremeTitle(stops, (level, best) => level > best),
    lowest: extremeTitle(stops, (level, best) => level < best),
    bigMoves: `${bigMoveCount(stops)}`,
  };
}

function hasRoom(stops: readonly TrackStop[], index: number): boolean {
  const { x } = stops[index];
  const before = index > 0 ? (x - stops[index - 1].x) / HALF : Infinity;
  const after = index < stops.length - 1 ? (stops[index + 1].x - x) / HALF : Infinity;
  return Math.min(before, after) >= CELL_HALF_WIDTH;
}

/** Cells for the facts that have a value, in order of importance, each under the next stop with room for it. */
export function specCells(stops: readonly TrackStop[]): SpecCell[] {
  const values = specValues(stops);
  const facts = SPEC_FACTS.filter((fact) => values[fact] !== null);
  const roomy = stops.filter((_, index) => hasRoom(stops, index));
  return facts.slice(0, roomy.length).map((fact, index) => ({ fact, x: roomy[index].x, value: values[fact] ?? "" }));
}
