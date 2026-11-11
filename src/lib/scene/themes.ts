/**
 * The registry of illustrated themes a ride can be drawn in: each theme's id, group and palette.
 * The palettes themselves live in src/lib/scene/palettes, one file per group, and their shape in palette.ts.
 * This module holds data only, and the Simple theme has no scene at all; names on screen come from the look messages.
 */
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";
import type { ScenePalette } from "./palette";
import { CLASSIC, MINIMAL, NIGHTMARE, POSTER } from "./palettes/artModes";
import { HAUNTED, NIGHT, RETRO, SUNNY, SUNSET } from "./palettes/scenes";
import { ARCADE, CONSTELLATION, GARDEN, MOUNTAIN, OCEAN, RIVER, SPACE, STORYBOOK } from "./palettes/worlds";

export const RIDE_THEMES = [
  "classic",
  "nightmare",
  "minimal",
  "poster",
  "space",
  "ocean",
  "mountain",
  "arcade",
  "garden",
  "constellation",
  "river",
  "storybook",
  "sunny",
  "sunset",
  "night",
  "retro",
  "haunted",
  "plain",
] as const;
export type RideTheme = (typeof RIDE_THEMES)[number];

export const RIDE_THEME_GROUPS = ["Art modes", "Worlds", "Scenes"] as const;
export type RideThemeGroup = (typeof RIDE_THEME_GROUPS)[number];

export const DEFAULT_RIDE_THEME: RideTheme = "sunny";

export type { ScenePalette, SceneryKind } from "./palette";

interface RideThemeDetails {
  /** The English name, for code outside the interface; components show the look.<theme>Theme message instead. */
  name: string;
  group: RideThemeGroup;
  /** Null means no scene, which draws the simple page-coloured ride. */
  palette: ScenePalette | null;
}

function englishName(theme: RideTheme): string {
  return translate(DEFAULT_LOCALE, `look.${theme}Theme`);
}

export const RIDE_THEME_DETAILS: Readonly<Record<RideTheme, RideThemeDetails>> = {
  classic: { name: englishName("classic"), group: "Art modes", palette: CLASSIC },
  nightmare: { name: englishName("nightmare"), group: "Art modes", palette: NIGHTMARE },
  minimal: { name: englishName("minimal"), group: "Art modes", palette: MINIMAL },
  poster: { name: englishName("poster"), group: "Art modes", palette: POSTER },
  space: { name: englishName("space"), group: "Worlds", palette: SPACE },
  ocean: { name: englishName("ocean"), group: "Worlds", palette: OCEAN },
  mountain: { name: englishName("mountain"), group: "Worlds", palette: MOUNTAIN },
  arcade: { name: englishName("arcade"), group: "Worlds", palette: ARCADE },
  garden: { name: englishName("garden"), group: "Worlds", palette: GARDEN },
  constellation: { name: englishName("constellation"), group: "Worlds", palette: CONSTELLATION },
  river: { name: englishName("river"), group: "Worlds", palette: RIVER },
  storybook: { name: englishName("storybook"), group: "Worlds", palette: STORYBOOK },
  sunny: { name: englishName("sunny"), group: "Scenes", palette: SUNNY },
  sunset: { name: englishName("sunset"), group: "Scenes", palette: SUNSET },
  night: { name: englishName("night"), group: "Scenes", palette: NIGHT },
  retro: { name: englishName("retro"), group: "Scenes", palette: RETRO },
  haunted: { name: englishName("haunted"), group: "Scenes", palette: HAUNTED },
  plain: { name: englishName("plain"), group: "Scenes", palette: null },
};
