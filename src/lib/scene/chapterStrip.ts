/**
 * Pure choice of colours for the chapter strip along the bottom of a themed ride.
 * Light skies keep the pale strip with dark text, and dark skies get a dark strip with light text.
 * It decides from the sky's relative luminance, so a new dark theme needs no extra code.
 */
import type { ScenePalette } from "./themes";

export interface StripColors {
  fill: string;
  ink: string;
}

/** Skies darker than this read as night, so a pale strip would stand out as a bright bar. */
export const DARK_SKY_LUMINANCE = 0.15;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const LINEAR_CUTOFF = 0.04045;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;

function linearChannel(value: number): number {
  const channel = value / CHANNEL_MAX;
  return channel <= LINEAR_CUTOFF ? channel / LINEAR_DIVISOR : ((channel + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA;
}

/** WCAG relative luminance of a "#rrggbb" colour, from 0 for black to 1 for white. */
export function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), HEX_RADIX);
  const red = linearChannel((value >> 16) & CHANNEL_MAX);
  const green = linearChannel((value >> 8) & CHANNEL_MAX);
  const blue = linearChannel(value & CHANNEL_MAX);
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
}

export function chapterStripColors(palette: ScenePalette): StripColors {
  return relativeLuminance(palette.skyTop) < DARK_SKY_LUMINANCE
    ? { fill: palette.ground, ink: palette.title }
    : { fill: palette.pill, ink: palette.ink };
}
