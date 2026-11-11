/**
 * Pure placement of the neon signs Nightmare Mode hangs between stops.
 * Each sign hangs under the rail halfway between two stops, or in clear sky when a label or the ground is in the way,
 * and is left out near the balloon or parachute. The drawing and the story picture's row cuts both read it.
 */
import type { Track, TrackPoint } from "@/lib/track/types";
import type { Scenery } from "./buildScenery";

export const SIGN_WIDTH = 74;
export const SIGN_HEIGHT = 30;
const SIGN_MARKER_CLEARANCE = 60;
/** How far under the rail each sign hangs, varied so they do not line up. */
const SIGN_DROPS = [34, 96, 58, 130];
const SIGN_GROUND_GAP = 24;
/** The clear band of sky above the track, where every flag and loop stays below. */
const SIGN_SKY_Y = -112;
/** How far below its stop a label reaches, so signs can stay clear of it. */
const BELOW_LABEL_REACH = 86;
const HALF = 2;

/** The top-left corner of each sign, none on a metro map. */
export function neonSignPositions(track: Track, scenery: Pick<Scenery, "balloon" | "parachute">): TrackPoint[] {
  if (track.style === "metro") {
    return [];
  }
  const markers = [scenery.balloon, scenery.parachute].flatMap((marker) => (marker ? [marker.x] : []));
  return track.stops.slice(1).flatMap((stop, index) => {
    const middle = (track.stops[index].x + stop.x) / HALF;
    const under = track.profile.filter(({ x }) => Math.abs(x - middle) <= SIGN_WIDTH);
    const railBottom = Math.max(...under.map(({ y }) => y));
    const y = railBottom + SIGN_DROPS[index % SIGN_DROPS.length];
    const isTaken = markers.some((x) => Math.abs(x - middle) < SIGN_MARKER_CLEARANCE);
    const fits = y + SIGN_HEIGHT + SIGN_GROUND_GAP <= track.groundY;
    const isUnderLabel = [track.stops[index], stop].some(
      (neighbour) => neighbour.labelSide === "below" && y < neighbour.y + BELOW_LABEL_REACH,
    );
    const signY = fits && !isUnderLabel ? y : SIGN_SKY_Y;
    return isTaken ? [] : [{ x: middle - SIGN_WIDTH / HALF, y: signY + track.contentOffset }];
  });
}
