/**
 * Space world: a life drawn as a rocket mission through stars and planets.
 * The rail becomes a glowing trail, and each stop sits on a faint orbit.
 * All shapes are original and built from the ride's own geometry.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import { PLANET_RING_REACH, PLANET_SIZE } from "@/lib/scene/placePlanets";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "space-sky";
const PLANET_COLORS = ["#f97316", "#38bdf8", "#c084fc", "#34d399"];
const ORBIT_RADIUS = 30;

export function SpaceBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      {scenery.stars.map(({ x, y, radius }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y / 0.7} r={radius} fill={palette.pill} />
      ))}
      {scenery.planets.map(({ x, y, scale }, index) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`} data-testid="space-planet">
          <circle r={PLANET_SIZE} fill={PLANET_COLORS[index % PLANET_COLORS.length]} />
          <circle cx={-14} cy={-12} r={PLANET_SIZE * 0.72} fill="#ffffff" opacity={0.12} />
          {index % 2 === 0 && (
            <ellipse rx={PLANET_SIZE * PLANET_RING_REACH} ry={10} fill="none" stroke={palette.pill} strokeWidth={3} opacity={0.6} transform="rotate(-18)" />
          )}
        </g>
      ))}
    </g>
  );
}

export function SpaceStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  return (
    <g aria-hidden="true" fill="none" stroke={palette.steel} strokeOpacity={0.5} data-testid="mode-structure">
      {track.profile.length > 0 &&
        track.stops.map(({ id, x, y }) => <circle key={id} cx={x} cy={y} r={ORBIT_RADIUS} strokeDasharray="3 6" />)}
    </g>
  );
}

export function SpaceRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={palette?.pill} strokeWidth={5} strokeLinecap="round" strokeDasharray="0.1 15" className="ride-track-ties" />
    </>
  );
}

export function Rocket({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g transform="translate(0 -24)">
      <path d="M-44 -7 L-62 0 L-44 7 Z" fill="#fb923c" />
      <path d="M-40 -12 L-52 -24 L-26 -14 Z M-40 12 L-52 24 L-26 14 Z" fill="#ef4444" stroke="#0f172a" strokeWidth={2} />
      <path d="M-44 -14 H14 Q38 -12 50 0 Q38 12 14 14 H-44 Z" fill={color} stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={8} r={15} fill="#bae6fd" stroke="#0f172a" strokeWidth={2} />
      <g transform="translate(8 0) scale(0.62)">
        <RiderArt rider={rider} />
      </g>
    </g>
  );
}
