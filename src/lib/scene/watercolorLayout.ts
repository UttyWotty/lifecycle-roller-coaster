/**
 * Pure layout for Watercolor: the rolling hill washes painted behind the ride, as closed SVG paths.
 * Each layer is a sum of two slow waves with its own phase, so hills overlap like brushed layers yet never repeat exactly.
 * Everything is computed from the width and fixed numbers, never at random, so redraws never flicker.
 */

export interface HillLayer {
  /** How far above the ground line the layer's middle sits. */
  lift: number;
  /** How far the hills rise and fall around that middle. */
  swell: number;
  wavelength: number;
  phase: number;
}

export const HILL_LAYERS: readonly HillLayer[] = [
  { lift: 150, swell: 46, wavelength: 620, phase: 0.4 },
  { lift: 95, swell: 38, wavelength: 470, phase: 2.1 },
  { lift: 40, swell: 26, wavelength: 360, phase: 4.3 },
];
/** Distance between sampled points along a hill line. */
export const HILL_STEP = 24;
/** The second, longer wave's share of the swell and its length relative to the first. */
const SECOND_WAVE_SHARE = 0.35;
const SECOND_WAVE_LENGTH = 2.7;
const FULL_TURN = Math.PI * 2;

function heightAt(x: number, layer: HillLayer): number {
  const first = Math.sin((x / layer.wavelength) * FULL_TURN + layer.phase);
  const second = Math.sin((x / (layer.wavelength * SECOND_WAVE_LENGTH)) * FULL_TURN + layer.phase * SECOND_WAVE_LENGTH);
  return layer.lift + layer.swell * ((1 - SECOND_WAVE_SHARE) * first + SECOND_WAVE_SHARE * second);
}

/** A closed path for one hill layer, from the left edge to the right and back along the bottom of the drawing. */
export function hillPath(width: number, ground: number, bottom: number, layer: HillLayer): string {
  const count = Math.ceil(width / HILL_STEP);
  const points = Array.from({ length: count + 1 }, (_, index) => {
    const x = Math.min(width, index * HILL_STEP);
    return `${x} ${(ground - heightAt(x, layer)).toFixed(1)}`;
  });
  return `M0 ${bottom} L${points.join(" L")} L${width} ${bottom} Z`;
}
