/**
 * Mountain world: a life drawn as an expedition across peaks and valleys.
 * The track is the trail along a rocky ridge, with snow on the summits and pines below.
 * All shapes are original and built from the ride's own geometry.
 */
import type { ReactElement } from "react";
import type { Building } from "@/lib/scene/buildScenery";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "mountain-sky";
const SNOW_LINE = 0.4;
const SNOW_WIDTH = 60;
const SNOW_DEPTH = 42;
const PINE_EVERY = 96;

function points(list: readonly { x: number; y: number }[]): string {
  return list.map(({ x, y }) => `${x},${y}`).join(" ");
}

/** Joins building positions into one jagged ridge running across the canvas. */
function ridge(buildings: readonly Building[], ground: number, width: number): string {
  const peaks = buildings.map(({ x, width: span, height }, index) => ({
    x: x + span / 2,
    y: ground - height * (index % 2 === 0 ? 1 : 0.68),
  }));
  return points([{ x: 0, y: ground }, ...peaks, { x: width, y: ground }]);
}

function Pine({ x, ground, color }: { x: number; ground: number; color: string }): ReactElement {
  return <path d={`M${x} ${ground - 58} l18 34 h-10 l14 24 h-44 l14 -24 h-10 Z`} fill={color} data-testid="mountain-pine" />;
}

export function MountainBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const ground = track.height;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <circle cx={track.width * 0.22} cy={92} r={46} fill={palette.cart} />
      <polygon points={ridge(scenery.skylineFar, ground, track.width)} fill={palette.skylineFar} />
      <polygon points={ridge(scenery.skylineNear, ground, track.width)} fill={palette.skylineNear} />
    </g>
  );
}

export function MountainStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, stops, groundY, width } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const outline = points([{ x: 0, y: groundY }, { x: 0, y: first.y }, ...profile, { x: width, y: last.y }, { x: width, y: groundY }]);
  const summits = stops.filter(({ y }) => y < groundY * SNOW_LINE + track.contentOffset / 2);
  const pines = Array.from({ length: Math.floor(width / PINE_EVERY) }, (_, index) => (index + 0.5) * PINE_EVERY);
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <polygon points={outline} fill={palette.steel} />
      {summits.map(({ id, x, y }) => (
        <path key={id} d={`M${x - SNOW_WIDTH} ${y + SNOW_DEPTH} L${x} ${y} L${x + SNOW_WIDTH} ${y + SNOW_DEPTH} l-20 -12 l-20 16 l-20 -14 l-20 14 l-20 -14 Z`} fill={palette.pill} />
      ))}
      {pines.map((x) => (
        <Pine key={x} x={x} ground={groundY} color={palette.ground} />
      ))}
    </g>
  );
}

export function MountainRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={palette?.steelDark} strokeWidth={8} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={palette?.pill} strokeWidth={3} strokeDasharray="9 9" className="ride-track-ties" />
    </>
  );
}

export function Hiker({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g>
      <g stroke="#0f172a" strokeWidth={5} strokeLinecap="round">
        <line x1={-2} y1={-26} x2={-12} y2={-2} />
        <line x1={4} y1={-26} x2={12} y2={-2} />
      </g>
      <line x1={22} y1={-44} x2={30} y2={-2} stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
      <rect x={-24} y={-52} width={16} height={26} rx={5} fill="#b45309" stroke="#0f172a" strokeWidth={2} />
      <rect x={-10} y={-50} width={24} height={28} rx={8} fill={color} stroke="#0f172a" strokeWidth={2} />
      <g transform="translate(2 -62)">
        <RiderArt rider={rider} />
      </g>
    </g>
  );
}
