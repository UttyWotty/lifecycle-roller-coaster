/**
 * Pure list of the parts of a ride drawing that the story picture must never cut when it wraps the ride onto rows.
 * Each stop label and each chapter name becomes a horizontal span, estimated with the same widths the drawing uses.
 * The story card prefers row cuts that fall outside every span, so no label or name is split between two rows.
 */
import { CHAPTER_CHARACTER_WIDTH } from "@/lib/track/rideChapters";
import { labelWidth } from "@/lib/track/labelWidth";
import type { Track } from "@/lib/track/types";

export interface Span {
  from: number;
  to: number;
}

const HALF = 2;

/** The span of a chapter name, centred in its band and never wider than the band. */
function chapterNameSpan(title: string, start: number, end: number): Span {
  const width = Math.min(title.length * CHAPTER_CHARACTER_WIDTH, end - start);
  const middle = (start + end) / HALF;
  return { from: middle - width / HALF, to: middle + width / HALF };
}

/** Every stop label and chapter name in the drawing, as spans a row cut should not pass through. */
export function keepWholeSpans(track: Pick<Track, "stops" | "chapterBands">): Span[] {
  const labels = track.stops.map(({ x, title, date }) => {
    const half = labelWidth(title, date) / HALF;
    return { from: x - half, to: x + half };
  });
  const chapters = track.chapterBands.map(({ title, start, end }) => chapterNameSpan(title, start, end));
  return [...labels, ...chapters];
}

/** True when a cut at x would split the span. */
export function cutsThrough(x: number, span: Span): boolean {
  return x > span.from && x < span.to;
}
