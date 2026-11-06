/**
 * Classic Ride: a soft pastel toy, with rounded tube supports, chunky blocks and gentle shadows.
 * Shading comes from gradients and one blur, so it feels moulded rather than flat.
 * All shapes are original and built from the track's own geometry.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SKY_ID = "toy-sky";
const TUBE_ID = "toy-tube";
const SOFT_ID = "toy-soft";
const FLOOR_SHARE = 0.16;
const TUBE_WIDTH = 20;
const FOOT_WIDTH = 46;
const FOOT_HEIGHT = 26;
const SHADOW_OPACITY = 0.22;
const BLOCK_SIZE_SHARE = 0.34;
const BLOCK_STEP = 0.32;
const BLOCK_RADIUS = 9;
const BLOCK_EVERY = 3;
const RAIL_WIDTH = 13;
const RAIL_HIGHLIGHT_WIDTH = 4;
const TIE_WIDTH = 5;
const TIE_PATTERN = "3 13";

function Block(props: { x: number; ground: number; width: number; height: number; palette: ScenePalette }): ReactElement {
  const { x, ground, width, height, palette } = props;
  return (
    <g fill={palette.skylineNear}>
      <rect x={x} y={ground - height} width={width} height={height} rx={BLOCK_RADIUS} />
      <rect
        x={x + width * 0.14}
        y={ground - height * (1 + BLOCK_STEP)}
        width={width * 0.72}
        height={height * BLOCK_STEP + BLOCK_RADIUS}
        rx={BLOCK_RADIUS}
        fill={palette.skylineFar}
      />
    </g>
  );
}

export function ToyBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const horizon = track.height * (1 - FLOOR_SHARE);
  const ground = track.contentOffset + track.groundY;
  const blocks = scenery.skylineNear.filter((_, index) => index % BLOCK_EVERY === 0);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
        <linearGradient id={TUBE_ID} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.steelDark} />
          <stop offset="0.4" stopColor={palette.steel} />
          <stop offset="1" stopColor={palette.steelDark} />
        </linearGradient>
        <filter id={SOFT_ID}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <rect y={horizon} width={track.width} height={track.height - horizon} fill={palette.ground} />
      {blocks.map(({ x, width, height }) => (
        <Block key={x} x={x} ground={ground} width={width} height={height * BLOCK_SIZE_SHARE} palette={palette} />
      ))}
    </g>
  );
}

export function ToyStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  if (track.profile.length === 0) {
    return null;
  }
  const { groundY, stops, supports } = track;
  const posts = supports.length > 0 ? supports : stops;
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {posts.map(({ x }) => (
        <ellipse key={`shadow-${x}`} cx={x} cy={groundY + 2} rx={FOOT_WIDTH * 0.8} ry={9} fill={palette.steelDark} opacity={SHADOW_OPACITY} filter={`url(#${SOFT_ID})`} />
      ))}
      {posts.map(({ x, y }) => (
        <g key={x}>
          <rect x={x - TUBE_WIDTH / 2} y={y} width={TUBE_WIDTH} height={groundY - y} fill={`url(#${TUBE_ID})`} />
          <rect x={x - FOOT_WIDTH / 2} y={groundY - FOOT_HEIGHT} width={FOOT_WIDTH} height={FOOT_HEIGHT} rx={10} fill={`url(#${TUBE_ID})`} />
        </g>
      ))}
    </g>
  );
}

export function ToyRail({ path, palette }: RailProps): ReactElement {
  const rail = palette?.rail;
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={rail} strokeWidth={RAIL_WIDTH} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={palette?.pill} strokeWidth={TIE_WIDTH} strokeDasharray={TIE_PATTERN} className="ride-track-ties" />
      <path d={path} fill="none" stroke={palette?.pill} strokeOpacity={0.45} strokeWidth={RAIL_HIGHLIGHT_WIDTH} transform="translate(0 -3)" className="ride-track-ties" />
    </>
  );
}
