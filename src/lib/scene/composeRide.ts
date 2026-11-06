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
import type { RideStyle, Track } from "@/lib/track/types";
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
}

/** Sky kept clear above the track, so the tallest flag and its label always fit. */
export const SKY_HEADROOM = 130;

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
  const base = addChapters(RIDE_STYLE_DETAILS[choices.style].build(events), choices.chapters ?? []);
  if (palette === null) {
    return { track: addTitle(base, choices.title), scene: null };
  }
  const track = addTitle(addHeadroom(addFloor(base, palette.floor), SKY_HEADROOM), choices.title);
  return {
    track,
    scene: {
      palette,
      scenery: buildScenery(track, palette),
      rider: choices.rider ?? DEFAULT_RIDER,
    },
  };
}
