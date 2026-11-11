/**
 * Pure layout for Comic Book Mode: the comic panels behind the ride and the sound-effect bursts above its big moves.
 * Panels follow the chapters, or group every few stops when there are none, cut halfway between stops.
 * A burst marks every stop reached by a big climb or drop, centred over the stop and kept narrow enough that a row cut
 * halfway between two stops never passes through it.
 */
import type { ChapterBand, TrackStop } from "@/lib/track/types";
import { chapterSpans } from "./chapterSpans";

export interface ComicPanel {
  from: number;
  to: number;
  /** Which of the panel colours this one takes, in turn. */
  tint: number;
}

export type BurstMood = "drop" | "climb";

export interface ComicBurst {
  id: string;
  x: number;
  mood: BurstMood;
  /** Which of the mood's words this burst shows, in turn. */
  word: number;
}

export const PANEL_TINTS = 4;
/** Without chapters, this many stops share one panel. */
export const STOPS_PER_PANEL = 3;
/** A move between two stops' levels at least this big earns a burst. */
export const BIG_MOVE = 6;
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

/** True when a burst over this stop clears the row cuts halfway to each neighbour. */
function hasRoom(stops: readonly TrackStop[], index: number): boolean {
  const { x } = stops[index];
  const before = index > 0 ? (x - stops[index - 1].x) / HALF : Infinity;
  const after = index < stops.length - 1 ? (stops[index + 1].x - x) / HALF : Infinity;
  return Math.min(before, after) >= BURST_HALF_WIDTH;
}

/** One burst over each stop reached by a big move, where there is room for it. */
export function comicBursts(stops: readonly TrackStop[]): ComicBurst[] {
  const counts: Record<BurstMood, number> = { drop: 0, climb: 0 };
  return stops.flatMap((stop, index) => {
    if (index === 0) {
      return [];
    }
    const move = stop.level - stops[index - 1].level;
    if (Math.abs(move) < BIG_MOVE || !hasRoom(stops, index)) {
      return [];
    }
    const mood: BurstMood = move < 0 ? "drop" : "climb";
    const word = counts[mood] % BURST_WORDS[mood].length;
    counts[mood] += 1;
    return [{ id: stop.id, x: stop.x, mood, word }];
  });
}
