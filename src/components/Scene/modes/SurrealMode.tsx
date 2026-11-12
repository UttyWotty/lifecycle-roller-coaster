/**
 * Surreal dream: a life ridden across a quiet dream plain under a deep teal sky, where things are not quite right.
 * Boulders float above their own shadows, doorways stand alone in the sand, white wisps drift past, and the rust
 * ladder track rides on spindly stilts with long evening shadows. All motifs are original and drawn in code.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import { doorways, floatingRocks, shadowEnd } from "@/lib/scene/surrealLayout";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SKY_ID = "surreal-sky";
const PLAIN_ID = "surreal-plain";
/** The plain begins this far above the ground line, so it reads as a wide, low horizon. */
const PLAIN_DEPTH = 150;
const MESA_SPACING = 420;
const MESA_HEIGHTS = [26, 44, 18, 36];
const SHADOW = "#3b2414";
const SHADOW_OPACITY = 0.28;
const SHADOW_WIDTH = 3;
const ROCK_SHADOW_SQUASH = 0.22;
/**
 * Boulders float in the band of sky above every flag and loop, measured up from the top of the track: with the drops
 * and sizes in surrealLayout.ts every boulder stays between 82 and 130 units above it, clear of the track and the title.
 */
const ROCK_SKY_Y = -88;
/** A floating boulder's shadow lies this far out on the plain, beyond the horizon line. */
const ROCK_SHADOW_DEPTH = 34;
const WISP_PIECES = "320 420";
const WISP = "#ffffff";
const WISP_OPACITY = 0.55;
const WISP_WIDTH = 9;
const WISP_SHARES = [0.22, 0.48];
const WISP_WAVE = 260;
const WISP_SWELL = 26;
const DOOR_WIDTH_SHARE = 0.48;
const DOOR_FRAME = 7;
const DOOR_GLOW = "#bfe9f0";
const STILT_WIDTH = 2.5;
const RAIL_GAP = 3.5;
const RAIL_WIDTH = 2.5;
const TIE_WIDTH = 11;
const TIE_DASHES = "2.5 9";
const HALF = 2;

function wispPath(width: number, y: number, phase: number): string {
  const count = Math.ceil(width / WISP_WAVE) + 1;
  const waves = Array.from({ length: count }, (_, index) => {
    const x = index * WISP_WAVE;
    const lift = (index + phase) % HALF === 0 ? -WISP_SWELL : WISP_SWELL;
    return `Q${x + WISP_WAVE / HALF} ${y + lift} ${x + WISP_WAVE} ${y}`;
  });
  return `M0 ${y} ${waves.join(" ")}`;
}

function rockPoints(size: number): string {
  const s = size;
  return `${-s},0 ${-s * 0.8},${-s * 0.7} ${-s * 0.2},${-s} ${s * 0.6},${-s * 0.8} ${s},${-s * 0.2} ${s * 0.7},0`;
}

export function SurrealBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette } = scene;
  const { width, height } = track;
  const ground = track.contentOffset + track.groundY;
  const horizon = ground - PLAIN_DEPTH;
  const mesas = Array.from({ length: Math.ceil(width / MESA_SPACING) }, (_, index) => index * MESA_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
        <linearGradient id={PLAIN_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skylineNear} />
          <stop offset="1" stopColor={palette.ground} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <g fill={palette.skylineFar}>
        {mesas.map((x, index) => {
          const rise = MESA_HEIGHTS[index % MESA_HEIGHTS.length];
          return <path key={x} d={`M${x} ${horizon} L${x + 40} ${horizon - rise} H${x + 180} L${x + 220} ${horizon} Z`} />;
        })}
      </g>
      <rect y={horizon} width={width} height={height - horizon} fill={`url(#${PLAIN_ID})`} data-testid="surreal-plain" />
      {doorways(width).map(({ x, height: tall }) => {
        const doorWidth = tall * DOOR_WIDTH_SHARE;
        const end = shadowEnd(x + doorWidth, ground, tall, PLAIN_DEPTH);
        return (
          <g key={x} data-testid="surreal-door">
            <path d={`M${x} ${ground} L${x + doorWidth} ${ground} L${end.x + doorWidth} ${end.y} L${end.x} ${end.y} Z`} fill={SHADOW} opacity={SHADOW_OPACITY} />
            <rect x={x} y={ground - tall} width={doorWidth} height={tall} fill={DOOR_GLOW} />
            <rect x={x} y={ground - tall} width={doorWidth} height={tall} fill="none" stroke={palette.steelDark} strokeWidth={DOOR_FRAME} />
          </g>
        );
      })}
      {floatingRocks(width).map(({ x, drop, size }) => (
        <g key={x} data-testid="surreal-rock">
          <ellipse cx={x + size} cy={horizon + ROCK_SHADOW_DEPTH} rx={size * HALF} ry={size * HALF * ROCK_SHADOW_SQUASH} fill={SHADOW} opacity={SHADOW_OPACITY} />
          <polygon points={rockPoints(size)} transform={`translate(${x} ${track.contentOffset + ROCK_SKY_Y + drop})`} fill={palette.steel} stroke={palette.steelDark} strokeWidth={2} />
        </g>
      ))}
      <g fill="none" stroke={WISP} strokeWidth={WISP_WIDTH} strokeLinecap="round" strokeDasharray={WISP_PIECES} opacity={WISP_OPACITY}>
        {WISP_SHARES.map((share, index) => (
          <path key={share} d={wispPath(width, horizon * share + (index === 0 ? 0 : PLAIN_DEPTH), index)} data-testid="surreal-wisp" />
        ))}
      </g>
    </g>
  );
}

export function SurrealStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { supports, groundY } = track;
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <g stroke={SHADOW} strokeWidth={SHADOW_WIDTH} opacity={SHADOW_OPACITY} strokeLinecap="round">
        {supports.map(({ x, y }) => {
          const end = shadowEnd(x, groundY, groundY - y, PLAIN_DEPTH);
          return <line key={`${x}-${y}`} x1={x} y1={groundY} x2={end.x} y2={end.y} data-testid="surreal-shadow" />;
        })}
      </g>
      <g stroke={palette.steelDark} strokeWidth={STILT_WIDTH}>
        {supports.map(({ x, y }) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={groundY} />
        ))}
      </g>
    </g>
  );
}

export function SurrealRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={palette?.steelDark} strokeWidth={TIE_WIDTH} strokeDasharray={TIE_DASHES} />
      <path d={path} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} transform={`translate(0 ${RAIL_GAP})`} />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} strokeLinecap="round" transform={`translate(0 ${-RAIL_GAP})`} className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
