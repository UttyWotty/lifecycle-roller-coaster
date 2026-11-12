/**
 * Pure layout for Surreal dream: floating boulders, lone doorways and the long evening shadows on the plain.
 * Boulders and doorways stand at a fixed rhythm along the width, never at random, so redraws never flicker.
 * Every shadow reaches back toward the horizon, away from a low sun in front, longer for taller things but never past it.
 */
import type { TrackPoint } from "@/lib/track/types";

export interface FloatingRock {
  x: number;
  /** How far below the top of the track's sky band the boulder's base floats. */
  drop: number;
  size: number;
}

export interface Doorway {
  x: number;
  height: number;
}

export const ROCK_SPACING = 520;
export const ROCK_DROPS = [0, -6, 2];
export const ROCK_SIZES = [30, 24, 36];
export const DOOR_SPACING = 640;
export const DOOR_HEIGHTS = [96, 118, 84];
/** How far a doorway sits from the start of its stretch, so doors and rocks never line up. */
const DOOR_OFFSET = 0.62;
const ROCK_OFFSET = 0.3;
/** A shadow runs this many times the height of what casts it, to the right. */
export const SHADOW_LENGTH = 1.6;
/** How steeply a shadow climbs the plain toward the horizon: its rise for each unit it runs. */
const SHADOW_SLOPE = 0.3;
/** Shadows stop this far short of the horizon. */
const HORIZON_MARGIN = 10;

export function floatingRocks(width: number): FloatingRock[] {
  const count = Math.max(1, Math.floor(width / ROCK_SPACING));
  return Array.from({ length: count }, (_, index) => ({
    x: (index + ROCK_OFFSET) * ROCK_SPACING,
    drop: ROCK_DROPS[index % ROCK_DROPS.length],
    size: ROCK_SIZES[index % ROCK_SIZES.length],
  }));
}

export function doorways(width: number): Doorway[] {
  const count = Math.max(1, Math.floor(width / DOOR_SPACING));
  return Array.from({ length: count }, (_, index) => ({
    x: (index + DOOR_OFFSET) * DOOR_SPACING,
    height: DOOR_HEIGHTS[index % DOOR_HEIGHTS.length],
  }));
}

/** Where the shadow of something standing at x on the ground, this tall, ends on a plain this deep. */
export function shadowEnd(x: number, groundY: number, height: number, plainDepth: number): TrackPoint {
  const reach = Math.max(0, plainDepth - HORIZON_MARGIN) / SHADOW_SLOPE;
  const run = Math.min(Math.max(0, height) * SHADOW_LENGTH, reach);
  return { x: x + run, y: groundY - run * SHADOW_SLOPE };
}
