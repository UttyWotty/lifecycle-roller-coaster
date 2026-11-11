/**
 * Pure layout for the Storybook world: one paper page per chapter, with a fold where each page turns.
 * Every stop hangs on a thread from a garland across the top, like a puppet in a paper theatre, with pennants between.
 * Pages alternate two paper tints, and every position is computed from the track, never random.
 */
import type { ChapterBand, TrackStop } from "@/lib/track/types";
import { chapterSpans } from "./chapterSpans";

export interface StoryPage {
  from: number;
  to: number;
  /** Which of the two paper tints this page uses. */
  tint: 0 | 1;
}

export interface Thread {
  id: string;
  x: number;
  top: number;
  bottom: number;
}

const TINTS = 2;
/** Threads stop just above the stop's marker, so they look tied to it. */
const MARKER_REACH = 14;

export function storyPages(chapters: readonly ChapterBand[], width: number): StoryPage[] {
  return chapterSpans(chapters, width).map(({ from, to, index }) => ({ from, to, tint: index % TINTS === 0 ? 0 : 1 }));
}

/** Where one page turns to the next: the left edge of every page but the first. */
export function pageFolds(pages: readonly StoryPage[]): number[] {
  return pages.slice(1).map(({ from }) => from);
}

/** One thread per stop, from the top of the page down to just above its marker. */
export function threadsFor(stops: readonly TrackStop[], top: number): Thread[] {
  return stops.map(({ id, x, y }) => ({ id, x, top, bottom: Math.max(top, y - MARKER_REACH) }));
}

export interface Pennant {
  x: number;
  /** Which of the garland's pennant colours this one takes, in turn. */
  color: number;
}

const PENNANT_COLORS = 3;
/** A gap this wide or wider between threads gets a pennant in its middle. */
const PENNANT_GAP = 60;

/** The garland's sag points: the left edge, every thread, and the right edge, in order. */
export function garlandPoints(threads: readonly Thread[], width: number): number[] {
  return [0, ...threads.map(({ x }) => x).sort((a, b) => a - b), width];
}

/** A pennant in the middle of every wide enough gap along the garland, colours taken in turn. */
export function pennants(points: readonly number[]): Pennant[] {
  return points
    .slice(1)
    .map((x, index) => ({ from: points[index], to: x }))
    .filter(({ from, to }) => to - from >= PENNANT_GAP)
    .map(({ from, to }, index) => ({ x: (from + to) / 2, color: index % PENNANT_COLORS }));
}
