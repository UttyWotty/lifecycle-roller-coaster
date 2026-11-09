/**
 * Pure assembly of everything needed to draw a ride.
 * It builds the chosen style, makes room for flags and a title, and adds the chosen theme's scenery.
 * The result is the same for the page, the landing example and the exported image.
 */
import type { LifeChapter } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { addChapters } from "@/lib/track/rideChapters";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import { addTitle } from "@/lib/track/rideTitle";
import type { RideStyle, StopLayout, Track } from "@/lib/track/types";
import { buildScenery, type Scenery } from "./buildScenery";
import { DEFAULT_RIDER, type Rider } from "./riders";
import { RIDE_THEME_DETAILS, type RideTheme, type ScenePalette } from "./themes";

export interface Scene {
  palette: ScenePalette;
  scenery: Scenery;
  rider: Rider;
}

export interface ComposedRide {
  track: Track;
  scene: Scene | null;
}

interface RideChoices {
  style: RideStyle;
  theme: RideTheme;
  title: string;
  /** Defaults to DEFAULT_RIDER, which is all the landing page example needs. */
  rider?: Rider;
  /** Defaults to none, which is all the landing page example needs. */
  chapters?: readonly LifeChapter[];
  /** Stop positions decided elsewhere, such as two rides lined up on one timeline. Defaults to the style's own. */
  layout?: StopLayout | null;
}

/** Sky kept clear above the track, so the tallest flag and its label always fit. */
export const SKY_HEADROOM = 130;
/** Minimal Mode draws no flags, so it needs only a little sky above its highest label. */
export const BARE_HEADROOM = 30;

function addFloor(track: Track, floor: number): Track {
  return { ...track, height: track.height + floor };
}

function addHeadroom(track: Track, headroom: number): Track {
  return {
    ...track,
    height: track.height + headroom,
    contentOffset: track.contentOffset + headroom,
  };
}

export function composeRide(events: readonly LifeEvent[], choices: RideChoices): ComposedRide {
  const { palette } = RIDE_THEME_DETAILS[choices.theme];
  const base = addChapters(RIDE_STYLE_DETAILS[choices.style].build(events, choices.layout ?? null), choices.chapters ?? []);
  if (palette === null) {
    return { track: addTitle(base, choices.title), scene: null };
  }
  const headroom = palette.kind === "line" ? BARE_HEADROOM : SKY_HEADROOM;
  const track = addTitle(addHeadroom(addFloor(base, palette.floor), headroom), choices.title);
  return {
    track,
    scene: {
      palette,
      scenery: buildScenery(track, palette),
      rider: choices.rider ?? DEFAULT_RIDER,
    },
  };
}
