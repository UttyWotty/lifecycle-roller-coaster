/**
 * Pure picker for the stops reached by a big climb or drop, which some looks mark with a badge in the sky.
 * A badge is centred over its stop and only kept when it fits inside the halfway points to both neighbours, so the
 * story picture's row cuts, made halfway between stops, never split one. Each mood takes its words in turn.
 */
import type { TrackStop } from "@/lib/track/types";

export type MoveMood = "drop" | "climb";

export interface MoveBadge {
  id: string;
  x: number;
  mood: MoveMood;
  /** Which of the mood's words this badge shows, in turn. */
  word: number;
}

/** A move between two stops' levels at least this big earns a badge. */
export const BIG_MOVE = 6;
const HALF = 2;

/** True when a badge this wide over the stop clears the row cuts halfway to each neighbour. */
function hasRoom(stops: readonly TrackStop[], index: number, halfWidth: number): boolean {
  const { x } = stops[index];
  const before = index > 0 ? (x - stops[index - 1].x) / HALF : Infinity;
  const after = index < stops.length - 1 ? (stops[index + 1].x - x) / HALF : Infinity;
  return Math.min(before, after) >= halfWidth;
}

/** One badge over each stop reached by a big move, where a badge of this half width has room. */
export function bigMoveBadges(stops: readonly TrackStop[], halfWidth: number, wordsPerMood: number): MoveBadge[] {
  const counts: Record<MoveMood, number> = { drop: 0, climb: 0 };
  return stops.flatMap((stop, index) => {
    if (index === 0) {
      return [];
    }
    const move = stop.level - stops[index - 1].level;
    if (Math.abs(move) < BIG_MOVE || !hasRoom(stops, index, halfWidth)) {
      return [];
    }
    const mood: MoveMood = move < 0 ? "drop" : "climb";
    const word = counts[mood] % wordsPerMood;
    counts[mood] += 1;
    return [{ id: stop.id, x: stop.x, mood, word }];
  });
}
