/**
 * The characters a person can choose to ride their cart.
 * All of them are original and drawn in code, with no outside artwork.
 * This module holds data only, and the drawings live with the components; names on screen come from the look messages.
 */
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

export const RIDERS = ["smiley", "cat", "robot", "astronaut", "dino", "ghost"] as const;
export type Rider = (typeof RIDERS)[number];

export const DEFAULT_RIDER: Rider = "smiley";

/** English names, for code outside the interface; components show the look.<rider>Rider message instead. */
export const RIDER_NAMES: Readonly<Record<Rider, string>> = Object.fromEntries(
  RIDERS.map((rider) => [rider, translate(DEFAULT_LOCALE, `look.${rider}Rider`)]),
) as Record<Rider, string>;
