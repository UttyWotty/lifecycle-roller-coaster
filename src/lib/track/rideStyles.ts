/**
 * Registry of the ride styles the user can choose between.
 * Each style pairs a generator with the words shown in the picker and read by screen readers.
 * Adding a style means adding one entry here and one generator that returns a Track.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { buildMetroMap } from "./buildMetroMap";
import { buildLoopTrack, buildTrack } from "./buildTrack";
import type { RideStyle, StopLayout, Track } from "./types";

interface RideStyleDetails {
  name: string;
  description: string;
  drawingLabel: string;
  /** A layout places stops at given x positions; styles that cannot follow one ignore it. */
  build: (events: readonly LifeEvent[], layout: StopLayout | null) => Track;
}

export const DEFAULT_RIDE_STYLE: RideStyle = "coaster";

export const RIDE_STYLE_DETAILS: Readonly<Record<RideStyle, RideStyleDetails>> = {
  coaster: {
    name: "Coaster",
    description: "The classic ride, up for good times and down for hard ones.",
    drawingLabel: "Your life as a roller coaster",
    build: buildTrack,
  },
  loops: {
    name: "Loop-the-loops",
    description: "Sharper drops, and a full loop at every big moment.",
    drawingLabel: "Your life as a roller coaster with loops",
    build: buildLoopTrack,
  },
  metro: {
    name: "Metro map",
    description: "One line for each part of your life, meeting at big moments.",
    drawingLabel: "Your life as a metro map",
    build: (events) => buildMetroMap(events),
  },
};
