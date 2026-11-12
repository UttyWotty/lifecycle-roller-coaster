/**
 * Pure layout for Comic Book Mode: the comic panels behind the ride and the sound-effect bursts above its big moves.
 * Panels follow the chapters, or group every few stops when there are none, cut halfway between stops.
 * A burst marks every stop reached by a big climb or drop, picked by bigMoves.ts so a row cut halfway between two
 * stops never passes through it.
 */
import type { ChapterBand, TrackStop } from "@/lib/track/types";
import { BIG_MOVE, bigMoveBadges, type MoveBadge, type MoveMood } from "./bigMoves";
import { chapterSpans } from "./chapterSpans";

export { BIG_MOVE };

export interface ComicPanel {
  from: number;
  to: number;
  /** Which of the panel colours this one takes, in turn. */
  tint: number;
}

export type BurstMood = MoveMood;
export type ComicBurst = MoveBadge;

export const PANEL_TINTS = 4;
/** Without chapters, this many stops share one panel. */
export const STOPS_PER_PANEL = 3;
/** Half the widest burst, so neighbours and row cuts can be kept clear of it. */
export const BURST_HALF_WIDTH = 46;
export const BURST_WORDS: Readonly<Record<BurstMood, readonly string[]>> = {
  drop: ["POW!", "BAM!", "WHAM!"],
  climb: ["WOW!", "ZOOM!", "YES!"],
};
const HALF = 2;

function stopPanels(stops: readonly TrackStop[], width: number): ComicPanel[] {
  const cuts: number[] = [];
  for (let index = STOPS_PER_PANEL; index < stops.length; index += STOPS_PER_PANEL) {
    cuts.push((stops[index - 1].x + stops[index].x) / HALF);
  }
  const edges = [0, ...cuts, width];
  return edges.slice(1).map((to, index) => ({ from: edges[index], to, tint: index % PANEL_TINTS }));
}

/** The panels behind the ride, left to right, covering the whole drawing. */
export function comicPanels(chapters: readonly ChapterBand[], stops: readonly TrackStop[], width: number): ComicPanel[] {
  if (chapters.length === 0) {
    return stopPanels(stops, width);
  }
  return chapterSpans(chapters, width).map(({ from, to, index }) => ({ from, to, tint: index % PANEL_TINTS }));
}

/** One burst over each stop reached by a big move, where there is room for it. */
export function comicBursts(stops: readonly TrackStop[]): ComicBurst[] {
  return bigMoveBadges(stops, BURST_HALF_WIDTH, BURST_WORDS.drop.length);
}
