/**
 * Pure layout for 8-Bit Life: the pixel grid every shape snaps to, the block pillars and the banners in the sky.
 * A LEVEL UP banner flies over each stop reached by a big climb and a CHECKPOINT banner over each big drop, so hard
 * moments read as a place to save progress, never as a loss. Banners come from bigMoves.ts, which keeps them clear of
 * the story picture's row cuts.
 */
import type { TrackStop } from "@/lib/track/types";
import { bigMoveBadges, type MoveBadge, type MoveMood } from "./bigMoves";

/** The size of one pixel block in drawing units. */
export const PIXEL_BLOCK = 16;
/** Half the widest banner, so neighbours and row cuts can be kept clear of it. */
export const BANNER_HALF_WIDTH = 54;
export const BANNER_WORDS: Readonly<Record<MoveMood, string>> = {
  climb: "LEVEL UP!",
  drop: "CHECKPOINT",
};
const WORDS_PER_MOOD = 1;

/** Rounds a value to the pixel grid. */
export function snapToBlock(value: number): number {
  return Math.round(value / PIXEL_BLOCK) * PIXEL_BLOCK;
}

/** The tops of the blocks stacked from just under the rail down to the ground, top first. */
export function blockStack(railY: number, groundY: number): number[] {
  const top = snapToBlock(railY) + PIXEL_BLOCK;
  const count = Math.max(0, Math.floor((groundY - top) / PIXEL_BLOCK));
  return Array.from({ length: count }, (_, index) => top + index * PIXEL_BLOCK);
}

/** One banner over each stop reached by a big climb or drop, where it has room. */
export function pixelBanners(stops: readonly TrackStop[]): MoveBadge[] {
  return bigMoveBadges(stops, BANNER_HALF_WIDTH, WORDS_PER_MOOD);
}
