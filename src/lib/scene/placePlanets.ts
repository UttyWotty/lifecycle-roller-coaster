/**
 * Pure placement of the planets in the Space world, picked from the scene's cloud positions.
 * A planet that would sit behind a stop label or a metro line name is left out, so every label stays readable.
 * Planets live in canvas coordinates, so label boxes are shifted down by the ride's content offset first.
 */
import type { Track, TrackPoint } from "@/lib/track/types";
import { type Box, boxesOverlap, isTallStop, labelBox, laneLabelBox } from "./labelLayout";

export interface Planet extends TrackPoint {
  scale: number;
}

/** Planet radius before scaling, and how far its ring reaches sideways as a share of that radius. */
export const PLANET_SIZE = 44;
export const PLANET_RING_REACH = 1.6;
/** Only every third cloud position becomes a planet, so the sky stays sparse. */
const PLANET_EVERY = 3;

function planetBox({ x, y, scale }: Planet): Box {
  const halfWidth = PLANET_SIZE * PLANET_RING_REACH * scale;
  const halfHeight = PLANET_SIZE * scale;
  return { x: x - halfWidth, y: y - halfHeight, width: halfWidth * 2, height: halfHeight * 2 };
}

/** Every stop label and metro line name, in canvas coordinates. */
export function rideLabelBoxes(track: Track): Box[] {
  const options = { isStation: track.style === "metro", isBare: false };
  const stops = track.stops.map((stop, index) => labelBox(stop, isTallStop(index, track.stops.length), options));
  const lanes = track.lines.flatMap(({ category, start }) => (category === null ? [] : [laneLabelBox(start, category)]));
  return [...stops, ...lanes].map((box) => ({ ...box, y: box.y + track.contentOffset }));
}

export function placePlanets(track: Track, spots: readonly Planet[]): Planet[] {
  const labels = rideLabelBoxes(track);
  return spots
    .filter((_, index) => index % PLANET_EVERY === 0)
    .filter((planet) => labels.every((label) => !boxesOverlap(planetBox(planet), label)));
}
