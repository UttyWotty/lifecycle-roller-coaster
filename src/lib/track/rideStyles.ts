/**
 * Registry of the ride styles the user can choose between, each a generator that returns the same Track type.
 * A style's name, description and drawing label are its look.<style>Name, Description and Drawing messages, so the
 * words follow the visitor's language. Adding a style means one entry here, one generator and those three messages.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { buildMetroMap } from "./buildMetroMap";
import { buildLoopTrack, buildTrack } from "./buildTrack";
import type { RideStyle, StopLayout, Track } from "./types";

interface RideStyleDetails {
  /** A layout places stops at given x positions; styles that cannot follow one ignore it. */
  build: (events: readonly LifeEvent[], layout: StopLayout | null) => Track;
}

export const DEFAULT_RIDE_STYLE: RideStyle = "coaster";

export const RIDE_STYLE_DETAILS: Readonly<Record<RideStyle, RideStyleDetails>> = {
  coaster: {
    build: buildTrack,
  },
  loops: {
    build: buildLoopTrack,
  },
  metro: {
    build: (events) => buildMetroMap(events),
  },
};
