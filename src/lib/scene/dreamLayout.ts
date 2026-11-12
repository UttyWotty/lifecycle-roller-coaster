/**
 * Pure layout for Dreamland: the soft rainbows behind the ride and the bank of cloud puffs it floats on.
 * Rainbows rise from the cloud floor at an even spacing, so a long ride gets several and a short one gets one in the
 * middle. Puff sizes repeat in a fixed rhythm rather than at random, so redraws never flicker.
 */

export interface Rainbow {
  x: number;
  radius: number;
}

export interface CloudPuff {
  x: number;
  radius: number;
}

/** One rainbow for every stretch this wide. */
export const RAINBOW_SPACING = 900;
/** A rainbow's outer radius as a share of the sky above the cloud floor, and the most it may be. */
const RAINBOW_HEIGHT_SHARE = 0.62;
const RAINBOW_MAX_RADIUS = 360;
/** Puffs are this far apart and cycle through these radii. */
export const PUFF_SPACING = 46;
export const PUFF_RADII = [34, 26, 40, 30, 22, 36];
const HALF = 2;

/** Rainbows centred in equal stretches of the drawing, sized to the sky above the cloud floor. */
export function rainbows(width: number, horizon: number): Rainbow[] {
  const count = Math.max(1, Math.round(width / RAINBOW_SPACING));
  const stretch = width / count;
  const radius = Math.min(RAINBOW_MAX_RADIUS, horizon * RAINBOW_HEIGHT_SHARE);
  return Array.from({ length: count }, (_, index) => ({ x: stretch * index + stretch / HALF, radius }));
}

/** Cloud puffs along the floor, from just off the left edge to just past the right, so the bank has no gaps. */
export function cloudFloor(width: number): CloudPuff[] {
  const count = Math.ceil(width / PUFF_SPACING) + 1;
  return Array.from({ length: count }, (_, index) => ({
    x: index * PUFF_SPACING,
    radius: PUFF_RADII[index % PUFF_RADII.length],
  }));
}
