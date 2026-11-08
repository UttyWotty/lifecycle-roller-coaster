/**
 * Ocean world: a life drawn as a voyage, with the track as the surface of the sea.
 * Highs ride the crests and lows sink into troughs, with fish and bubbles in the deep.
 * All shapes are original and built from the ride's own geometry.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import { loopRadius } from "@/lib/track/buildTrack";
import type { Track, TrackPoint } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "ocean-sky";
const WATER_ID = "ocean-water";
const WAVE_DROPS = [34, 74, 122];
const SAND_HEIGHT = 34;
/** The open sea behind the waves is paler, so deep troughs show distant water instead of sky. */
const FAR_SEA_OPACITY = 0.55;
/** A loop on the water is a curling wave, filled with sea so it reads as part of the ocean. */
const CURL_OPACITY = 0.8;

/** The middle height of the waves, where the open sea meets the sky behind them. */
function horizonY(profile: readonly TrackPoint[]): number {
  const heights = profile.map(({ y }) => y).sort((a, b) => a - b);
  return heights[Math.floor(heights.length / 2)];
}

function points(list: readonly { x: number; y: number }[]): string {
  return list.map(({ x, y }) => `${x},${y}`).join(" ");
}

function Fish({ x, y, color }: { x: number; y: number; color: string }): ReactElement {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="ocean-fish">
      <ellipse rx={18} ry={9} fill={color} />
      <path d="M-16 0 L-30 -9 L-30 9 Z" fill={color} />
      <circle cx={10} cy={-2} r={2} fill="#0f172a" />
    </g>
  );
}

export function OceanBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
        <linearGradient id={WATER_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.steel} />
          <stop offset="1" stopColor={palette.steelDark} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <circle cx={track.width * 0.8} cy={96} r={58} fill={palette.cart} />
      {scenery.clouds.map(({ x, y, scale }) => (
        <ellipse key={x} cx={x} cy={y * 0.6 + 20} rx={64 * scale} ry={15 * scale} fill={palette.cloud} />
      ))}
      {track.profile.length === 0 && (
        <rect y={track.height * 0.5} width={track.width} height={track.height / 2} fill={`url(#${WATER_ID})`} />
      )}
    </g>
  );
}

export function OceanStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, stops, groundY, width } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const surface = [{ x: 0, y: first.y }, ...profile, { x: width, y: last.y }];
  const outline = points([...surface, { x: width, y: groundY }, { x: 0, y: groundY }]);
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <rect y={horizonY(profile)} width={width} height={groundY - horizonY(profile)} fill={`url(#${WATER_ID})`} opacity={FAR_SEA_OPACITY} data-testid="ocean-far-sea" />
      <polygon points={outline} fill={`url(#${WATER_ID})`} />
      {track.style === "loops" &&
        stops
          .filter(({ isMajor }) => isMajor)
          .map(({ id, x, y, impact }) => (
            <circle key={id} cx={x} cy={y - loopRadius(impact)} r={loopRadius(impact)} fill={`url(#${WATER_ID})`} opacity={CURL_OPACITY} data-testid="ocean-curl" />
          ))}
      <g fill="none" stroke={palette.pill} strokeOpacity={0.28} strokeWidth={3}>
        {WAVE_DROPS.map((drop) => (
          <polyline key={drop} points={points(surface.map(({ x, y }) => ({ x, y: Math.min(y + drop, groundY - SAND_HEIGHT) })))} />
        ))}
      </g>
      {stops.slice(1).map(({ id, x }, index) => (
        <Fish key={id} x={x - 90} y={groundY - 52 - (index % 3) * 26} color={index % 2 === 0 ? palette.cart : palette.pill} />
      ))}
      <rect y={groundY - SAND_HEIGHT} width={width} height={SAND_HEIGHT} fill={palette.ground} />
    </g>
  );
}

export function OceanRail({ path, palette }: RailProps): ReactElement {
  return <path d={path} pathLength={1} fill="none" stroke={palette?.pill} strokeWidth={6} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />;
}

export function Boat({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g>
      <line x1={8} y1={-14} x2={8} y2={-74} stroke="#78350f" strokeWidth={4} />
      <path d="M12 -72 L46 -22 H12 Z" fill="#ffffff" stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
      <g transform="translate(-16 -30)">
        <RiderArt rider={rider} />
      </g>
      <path d="M-46 -16 H48 L32 8 H-30 Z" fill={color} stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}
