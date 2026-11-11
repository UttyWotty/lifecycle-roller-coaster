/**
 * Pure layout for the Garden world: where leaves sprout along the vine, which season each stretch of ground is,
 * and how each stop blooms. Leaves follow the rail's own height profile, so they always sit on the stem.
 * Seasons follow the ride's chapters in order, and every value is computed, never random, so redraws match.
 */
import type { EventSentiment } from "@/lib/events/schema";
import type { ChapterBand, TrackPoint, TrackStop } from "@/lib/track/types";
import { chapterSpans } from "./chapterSpans";

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];
/** A ride with no chapters is all summer. */
export const DEFAULT_SEASON: Season = "summer";

export interface LeafSpot extends TrackPoint {
  /** Degrees, along the stem's slope. */
  angle: number;
  /** Which side of the stem the leaf grows on. */
  side: "up" | "down";
}

export interface SeasonBand {
  from: number;
  to: number;
  season: Season;
}

export type BloomShape = "flower" | "thorns" | "sprout";

export interface Bloom {
  id: string;
  x: number;
  y: number;
  shape: BloomShape;
  /** Reach from the stop's centre, larger for bigger moments. */
  radius: number;
}

/** Room between leaves along the stem. */
export const LEAF_SPACING = 56;
/** Leaves keep away from stops, where the blooms are. */
const STOP_CLEARANCE = 40;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const BLOOM_BASE_RADIUS = 18;
const BLOOM_RADIUS_PER_IMPACT = 1.6;
const SHAPES: Readonly<Record<EventSentiment, BloomShape>> = { positive: "flower", negative: "thorns", neutral: "sprout" };

function heightAt(profile: readonly TrackPoint[], x: number): { y: number; slope: number } {
  const next = profile.findIndex((point) => point.x >= x);
  const after = profile[Math.max(next, 1)] ?? profile[profile.length - 1];
  const before = profile[Math.max(next, 1) - 1] ?? after;
  const run = after.x - before.x;
  const share = run === 0 ? 0 : (x - before.x) / run;
  return { y: before.y + (after.y - before.y) * share, slope: run === 0 ? 0 : (after.y - before.y) / run };
}

/** Leaves at a steady spacing along the stem, alternating sides, skipping the stretch around each stop. */
export function leafSpots(profile: readonly TrackPoint[], stops: readonly Pick<TrackStop, "x">[]): LeafSpot[] {
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return [];
  }
  const spots: LeafSpot[] = [];
  for (let x = first.x + LEAF_SPACING / 2; x < last.x; x += LEAF_SPACING) {
    if (stops.some((stop) => Math.abs(stop.x - x) < STOP_CLEARANCE)) {
      continue;
    }
    const { y, slope } = heightAt(profile, x);
    spots.push({ x, y, angle: Math.atan(slope) * DEGREES_PER_RADIAN, side: spots.length % 2 === 0 ? "up" : "down" });
  }
  return spots;
}

/** The ground's seasons from left to right: one per chapter in order, stretched to meet, covering the whole width. */
export function seasonBands(chapters: readonly ChapterBand[], width: number): SeasonBand[] {
  if (chapters.length === 0) {
    return [{ from: 0, to: width, season: DEFAULT_SEASON }];
  }
  return chapterSpans(chapters, width).map(({ from, to, index }) => ({ from, to, season: SEASONS[index % SEASONS.length] }));
}

/** How each stop blooms: a flower for a good moment, thorns for a hard one, a sprout otherwise. */
export function bloomsFor(stops: readonly TrackStop[]): Bloom[] {
  return stops.map(({ id, x, y, sentiment, impact }) => ({
    id,
    x,
    y,
    shape: SHAPES[sentiment],
    radius: BLOOM_BASE_RADIUS + impact * BLOOM_RADIUS_PER_IMPACT,
  }));
}
