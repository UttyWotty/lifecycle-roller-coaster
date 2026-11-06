/**
 * Minimal Mode: a clean black line drawing on white, with no fills and no colour.
 * The supports are tall rounded loops, so the whole ride reads like one continuous pen stroke.
 * It is built only from the track's own geometry.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track, TrackPoint } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const LINE_WIDTH = 2.5;
const RAIL_OUTER_WIDTH = 12;
const RAIL_INNER_WIDTH = 7;
const LOOP_INSET = 14;
const LOOP_GAP = 16;
const LOOP_RADIUS = 18;
/** Loops too short to read as a shape are left out, so low stretches stay clean. */
const SHORTEST_LOOP = LOOP_RADIUS * 2;

function heightAt(profile: readonly TrackPoint[], x: number): number {
  const next = profile.findIndex((point) => point.x >= x);
  return profile[Math.max(next, 0)].y;
}

function loopPath(left: number, right: number, top: number, ground: number): string {
  const radius = LOOP_RADIUS;
  return `M${left} ${ground} V${top + radius} Q${left} ${top} ${left + radius} ${top} H${right - radius} Q${right} ${top} ${right} ${top + radius} V${ground}`;
}

export function LineBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <rect width={track.width} height={track.height} fill={scene.palette.skyTop} data-testid="scene-sky" />
    </g>
  );
}

export function LineStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, stops, groundY } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const edges = [first.x, ...stops.map(({ x }) => x), last.x];
  const loops = edges.slice(1).flatMap((edge, index) => {
    const left = edges[index] + LOOP_INSET;
    const right = edge - LOOP_INSET;
    const span = profile.filter(({ x }) => x >= left && x <= right).map(({ y }) => y);
    const top = Math.max(...span, heightAt(profile, left), heightAt(profile, right)) + LOOP_GAP;
    const isDrawable = right - left > SHORTEST_LOOP && groundY - top > SHORTEST_LOOP;
    return isDrawable ? [loopPath(left, right, top, groundY)] : [];
  });
  return (
    <g aria-hidden="true" fill="none" stroke={palette.ink} strokeWidth={LINE_WIDTH} strokeLinecap="round" data-testid="mode-structure">
      {loops.map((path) => (
        <path key={path} d={path} />
      ))}
      <line x1={0} y1={groundY} x2={track.width} y2={groundY} />
    </g>
  );
}

export function LineRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={palette?.ink} strokeWidth={RAIL_OUTER_WIDTH} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={palette?.skyTop} strokeWidth={RAIL_INNER_WIDTH} strokeLinecap="round" className="ride-track-ties" />
    </>
  );
}
