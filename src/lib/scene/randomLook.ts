/**
 * Picks a surprise look for a ride: a ride style, a theme and a rider, chosen from the lists given.
 * The theme always differs from the current one, so every press visibly changes the drawing, and themes without
 * scenery are never picked because a surprise should never be a blank page. The random source is an argument, so the
 * module stays pure and tests can drive it with fixed numbers.
 */
import type { RideStyle } from "@/lib/track/types";
import type { Rider } from "./riders";
import type { RideTheme } from "./themes";

/** Themes a surprise never lands on: the plain theme draws no scenery at all. */
export const SURPRISE_EXCLUDED_THEMES: readonly RideTheme[] = ["plain"];

export interface RideLook {
  style: RideStyle;
  theme: RideTheme;
  rider: Rider;
}

export interface LookChoices {
  styles: readonly RideStyle[];
  themes: readonly RideTheme[];
  riders: readonly Rider[];
}

/** Returns a number in [0, 1), as Math.random does. */
export type RandomSource = () => number;

/** Raised when a list to pick from is empty, which would make a surprise impossible. */
export class NoSurpriseLookError extends Error {
  constructor(list: string) {
    super(`No ${list} to choose a surprise look from.`);
    this.name = "NoSurpriseLookError";
  }
}

function pick<T>(options: readonly T[], random: RandomSource, list: string): T {
  if (options.length === 0) {
    throw new NoSurpriseLookError(list);
  }
  const index = Math.min(options.length - 1, Math.floor(random() * options.length));
  return options[index];
}

/** A new look whose theme is never the current one; style and rider may stay the same. */
export function pickSurpriseLook(current: RideLook, choices: LookChoices, random: RandomSource): RideLook {
  const themes = choices.themes.filter(
    (theme) => theme !== current.theme && !SURPRISE_EXCLUDED_THEMES.includes(theme),
  );
  return {
    style: pick(choices.styles, random, "ride styles"),
    theme: pick(themes, random, "themes"),
    rider: pick(choices.riders, random, "riders"),
  };
}
