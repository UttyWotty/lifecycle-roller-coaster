/**
 * 8-Bit Life: a life drawn as a bright daytime pixel adventure, unlike the Arcade world's night-time level.
 * Blocky clouds and stepped hills sit over grass-topped dirt, the rail rests on stacked stone blocks, and banners mark
 * every big climb and drop. Every shape snaps to one block grid and is original, taken from no existing game.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { BANNER_HALF_WIDTH, BANNER_WORDS, PIXEL_BLOCK, blockStack, pixelBanners, snapToBlock } from "@/lib/scene/pixelLayout";
import type { MoveBadge } from "@/lib/scene/bigMoves";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const CRISP = { shapeRendering: "crispEdges" } as const;
const DIRT_ID = "pixel-dirt";
const DIRT_SPECK = "#8f4f22";
const GRASS = "#4cbb3a";
const GRASS_DARK = "#2f8a25";
const CLOUD_SHADE = "#d6ecff";
const BLOCK_SHADE_OPACITY = 0.28;
const BLOCK_SHINE = "#ffffff";
const BLOCK_SHINE_OPACITY = 0.35;
const BLOCK_EDGE = 2;
/** Hills are stepped pyramids this many blocks high, one every so many units, behind the track. */
const HILL_SPACING = 360;
const HILL_STEPS = 4;
const HILL_STEP_INSET = 2;
const CLOUD_HEIGHT_SHARE = 0.55;
/** The banners' band of sky, above every flag and loop, measured up from the top of the track. */
const BANNER_SKY_Y = -100;
const BANNER_HEIGHT = 26;
const BANNER_NOTCH = 8;
const BANNER_WORD_SIZE = 13;
const BANNER_BASELINE = 18;
const BANNER_FILLS = { climb: "#ffd23f", drop: "#7ee0ff" } as const;
const PIXEL_FONT = "'Courier New', Courier, monospace";
const RAIL_EDGE_WIDTH = 11;
const RAIL_WIDTH = 5;
const TIE_WIDTH = 11;
const TIE_DASHES = "4 12";
const HALF = 2;

function Hill({ x, ground, color }: { x: number; ground: number; color: string }): ReactElement {
  return (
    <g fill={color}>
      {Array.from({ length: HILL_STEPS }, (_, step) => {
        const inset = step * HILL_STEP_INSET * PIXEL_BLOCK;
        const width = (HILL_STEPS * HILL_STEP_INSET * HALF - step * HILL_STEP_INSET * HALF) * PIXEL_BLOCK;
        return <rect key={step} x={x + inset} y={ground - (step + 1) * PIXEL_BLOCK} width={width} height={PIXEL_BLOCK} />;
      })}
    </g>
  );
}

function Cloud({ x, y }: { x: number; y: number }): ReactElement {
  const left = snapToBlock(x);
  const top = snapToBlock(y);
  return (
    <g data-testid="pixel-cloud">
      <rect x={left + PIXEL_BLOCK} y={top} width={PIXEL_BLOCK * 3} height={PIXEL_BLOCK} fill="#ffffff" />
      <rect x={left} y={top + PIXEL_BLOCK} width={PIXEL_BLOCK * 5} height={PIXEL_BLOCK} fill="#ffffff" />
      <rect x={left} y={top + PIXEL_BLOCK * 2} width={PIXEL_BLOCK * 5} height={PIXEL_BLOCK / HALF} fill={CLOUD_SHADE} />
    </g>
  );
}

function Banner({ badge, y, ink }: { badge: MoveBadge; y: number; ink: string }): ReactElement {
  const left = badge.x - BANNER_HALF_WIDTH + BANNER_NOTCH;
  const right = badge.x + BANNER_HALF_WIDTH - BANNER_NOTCH;
  const mid = y + BANNER_HEIGHT / HALF;
  const outline = `${left - BANNER_NOTCH},${y} ${right + BANNER_NOTCH},${y} ${right},${mid} ${right + BANNER_NOTCH},${y + BANNER_HEIGHT} ${left - BANNER_NOTCH},${y + BANNER_HEIGHT} ${left},${mid}`;
  return (
    <g data-testid="pixel-banner" data-mood={badge.mood}>
      <polygon points={outline} fill={BANNER_FILLS[badge.mood]} stroke={ink} strokeWidth={3} strokeLinejoin="miter" />
      <text x={badge.x} y={y + BANNER_BASELINE} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize={BANNER_WORD_SIZE} fontWeight={700} fill={ink}>
        {BANNER_WORDS[badge.mood]}
      </text>
    </g>
  );
}

export function PixelBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
  const horizon = snapToBlock(track.contentOffset + track.groundY);
  const hills = Array.from({ length: Math.ceil(width / HILL_SPACING) }, (_, index) => index * HILL_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop" {...CRISP}>
      <defs>
        <pattern id={DIRT_ID} width={PIXEL_BLOCK * 2} height={PIXEL_BLOCK * 2} patternUnits="userSpaceOnUse">
          <rect width={PIXEL_BLOCK * 2} height={PIXEL_BLOCK * 2} fill={palette.ground} />
          <rect x={4} y={6} width={4} height={4} fill={DIRT_SPECK} />
          <rect x={22} y={20} width={4} height={4} fill={DIRT_SPECK} />
          <rect x={14} y={26} width={4} height={4} fill={DIRT_SPECK} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={palette.skyTop} data-testid="scene-sky" />
      {hills.map((x, index) => (
        <Hill key={x} x={x} ground={horizon} color={index % HALF === 0 ? palette.skylineFar : palette.skylineNear} />
      ))}
      {scenery.clouds.map(({ x, y }) => (
        <Cloud key={x} x={x} y={y * CLOUD_HEIGHT_SHARE} />
      ))}
      <rect y={horizon} width={width} height={Math.max(0, height - horizon)} fill={`url(#${DIRT_ID})`} />
      <rect y={horizon} width={width} height={PIXEL_BLOCK / HALF} fill={GRASS} data-testid="pixel-grass" />
      <rect y={horizon + PIXEL_BLOCK / HALF} width={width} height={BLOCK_EDGE * HALF} fill={GRASS_DARK} />
      {pixelBanners(track.stops).map((badge) => (
        <Banner key={badge.id} badge={badge} y={track.contentOffset + BANNER_SKY_Y - BANNER_HEIGHT / HALF} ink={palette.ink} />
      ))}
    </g>
  );
}

function Block({ x, y, palette }: { x: number; y: number; palette: ScenePalette }): ReactElement {
  return (
    <g>
      <rect x={x} y={y} width={PIXEL_BLOCK} height={PIXEL_BLOCK} fill={palette.steel} stroke={palette.steelDark} strokeWidth={BLOCK_EDGE} />
      <rect x={x + BLOCK_EDGE} y={y + BLOCK_EDGE} width={PIXEL_BLOCK - BLOCK_EDGE * HALF} height={BLOCK_EDGE} fill={BLOCK_SHINE} opacity={BLOCK_SHINE_OPACITY} />
      <rect x={x + PIXEL_BLOCK - BLOCK_EDGE * HALF} y={y + BLOCK_EDGE} width={BLOCK_EDGE} height={PIXEL_BLOCK - BLOCK_EDGE * HALF} fill={palette.steelDark} opacity={BLOCK_SHADE_OPACITY} />
    </g>
  );
}

export function PixelStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { supports, groundY } = track;
  return (
    <g aria-hidden="true" data-testid="mode-structure" {...CRISP}>
      {supports.map(({ x, y }) => {
        const left = snapToBlock(x) - PIXEL_BLOCK / HALF;
        return (
          <g key={`${x}-${y}`} data-testid="pixel-pillar">
            {blockStack(y, groundY).map((top) => (
              <Block key={top} x={left} y={top} palette={palette} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

export function PixelRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={palette?.steelDark} strokeWidth={RAIL_EDGE_WIDTH} strokeLinecap="square" strokeLinejoin="miter" />
      <path d={path} fill="none" stroke={palette?.ink} strokeWidth={TIE_WIDTH} strokeDasharray={TIE_DASHES} />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} strokeLinecap="square" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
