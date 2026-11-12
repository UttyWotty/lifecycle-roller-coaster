/**
 * Watercolor: a life painted in soft washes on textured paper, like a pen-and-wash sketchbook page.
 * Sky, clouds and rolling hills are translucent layers whose edges wobble and pool like wet paint, and the rail is a
 * sepia ink line laid over a broad wash of colour. Every shape is original, made in code with SVG noise filters.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import { HILL_LAYERS, hillPath } from "@/lib/scene/watercolorLayout";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SKY_ID = "watercolor-sky";
const WOBBLE_ID = "watercolor-wobble";
const BLEED_ID = "watercolor-bleed";
const PEN_ID = "watercolor-pen";
const PEN_SCALE = 3;
const BLOOM_OPACITY = 0.35;
const BLOOM_WIDTH = 170;
const BLOOM_HEIGHT = 70;
const BLOOM_TINT = "#fbd3c0";
const BLOOM_EVERY = 2;
const PAPER_ID = "watercolor-paper";
const WOBBLE_FREQUENCY = 0.018;
const WOBBLE_SCALE = 12;
const BLEED_BLUR = 6;
const PAPER_FREQUENCY = 0.85;
const PAPER_OPACITY = 0.1;
const HILL_FILLS_OPACITY = 0.5;
const HILL_EDGE_OPACITY = 0.4;
const HILL_EDGE_WIDTH = 2.5;
const CLOUD_OPACITY = 0.8;
const CLOUD_SKY_SHARE = 0.65;
const CLOUD_WIDTH = 90;
const CLOUD_HEIGHT = 26;
const SUPPORT_INK_WIDTH = 1.6;
const SUPPORT_WASH_WIDTH = 7;
const SUPPORT_WASH_OPACITY = 0.3;
const RAIL_WASH_WIDTH = 18;
const RAIL_WASH_OPACITY = 0.45;
const RAIL_INK_WIDTH = 3;
const RAIL_SECOND_INK_WIDTH = 1.2;
const RAIL_SECOND_INK_DROP = 6;
const SEPIA = "#5b4636";
/** Filters must cover the whole drawing, including what sits above or below the track. */
const FILTER_MARGIN = 2;

function filterBox(track: Track): { x: number; y: number; width: number; height: number } {
  return { x: -track.width, y: -track.height, width: track.width * (FILTER_MARGIN + 1), height: track.height * (FILTER_MARGIN + 1) };
}

function PaintDefs({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const box = filterBox(track);
  return (
    <defs>
      <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={palette.skyTop} />
        <stop offset="1" stopColor={palette.skyBottom} />
      </linearGradient>
      <filter id={WOBBLE_ID} filterUnits="userSpaceOnUse" {...box}>
        <feTurbulence type="fractalNoise" baseFrequency={WOBBLE_FREQUENCY} numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={WOBBLE_SCALE} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={PEN_ID} filterUnits="userSpaceOnUse" {...box}>
        <feTurbulence type="fractalNoise" baseFrequency={WOBBLE_FREQUENCY} numOctaves={1} seed={11} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={PEN_SCALE} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={BLEED_ID} filterUnits="userSpaceOnUse" {...box}>
        <feGaussianBlur stdDeviation={BLEED_BLUR} />
      </filter>
      <filter id={PAPER_ID} filterUnits="userSpaceOnUse" x={0} y={0} width={track.width} height={track.height}>
        <feTurbulence type="fractalNoise" baseFrequency={PAPER_FREQUENCY} numOctaves={2} seed={3} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
  );
}

export function WatercolorBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
  const horizon = track.contentOffset + track.groundY;
  const hillColors = [palette.skylineFar, palette.skylineNear, palette.ground];
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <PaintDefs track={track} palette={palette} />
      <rect width={width} height={height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <g filter={`url(#${BLEED_ID})`} opacity={BLOOM_OPACITY}>
        {scenery.clouds.filter((_, index) => index % BLOOM_EVERY === 1).map(({ x, y, scale }) => (
          <ellipse key={x} cx={x} cy={y} rx={BLOOM_WIDTH * scale} ry={BLOOM_HEIGHT * scale} fill={BLOOM_TINT} data-testid="watercolor-bloom" />
        ))}
      </g>
      <g filter={`url(#${BLEED_ID})`} opacity={CLOUD_OPACITY}>
        {scenery.clouds.map(({ x, y, scale }) => (
          <ellipse key={x} cx={x} cy={y * CLOUD_SKY_SHARE} rx={CLOUD_WIDTH * scale} ry={CLOUD_HEIGHT * scale} fill={palette.cloud} data-testid="watercolor-cloud" />
        ))}
      </g>
      <g filter={`url(#${WOBBLE_ID})`}>
        {HILL_LAYERS.map((layer, index) => (
          <path
            key={layer.phase}
            d={hillPath(width, horizon, height, layer)}
            fill={hillColors[index]}
            fillOpacity={HILL_FILLS_OPACITY}
            stroke={hillColors[index]}
            strokeOpacity={HILL_EDGE_OPACITY}
            strokeWidth={HILL_EDGE_WIDTH}
            data-testid="watercolor-hill"
          />
        ))}
      </g>
      <rect width={width} height={height} filter={`url(#${PAPER_ID})`} opacity={PAPER_OPACITY} data-testid="watercolor-paper" />
    </g>
  );
}

export function WatercolorStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { supports, groundY } = track;
  return (
    <g aria-hidden="true" data-testid="mode-structure" filter={`url(#${PEN_ID})`}>
      <g stroke={palette.steel} strokeWidth={SUPPORT_WASH_WIDTH} opacity={SUPPORT_WASH_OPACITY}>
        {supports.map(({ x, y }) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={groundY} />
        ))}
      </g>
      <g stroke={SEPIA} strokeWidth={SUPPORT_INK_WIDTH}>
        {supports.map(({ x, y }) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={groundY} />
        ))}
      </g>
    </g>
  );
}

export function WatercolorRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WASH_WIDTH} strokeOpacity={RAIL_WASH_OPACITY} strokeLinecap="round" filter={`url(#${WOBBLE_ID})`} />
      <path d={path} fill="none" stroke={SEPIA} strokeWidth={RAIL_SECOND_INK_WIDTH} transform={`translate(0 ${RAIL_SECOND_INK_DROP})`} />
      <path d={path} pathLength={1} fill="none" stroke={SEPIA} strokeWidth={RAIL_INK_WIDTH} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
