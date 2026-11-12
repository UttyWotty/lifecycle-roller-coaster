/**
 * Isometric model: a life built as a small 3D model on a tiled slab, like a toy ride photographed on a desk.
 * Depth is faked by pushing shapes back along one direction: the rail is a solid ribbon with a lit top edge, the
 * supports are box pillars with shaded sides, and painted boxes sit around the slab. All shapes are original and drawn in code.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { DEPTH, boxFaces, railOffsets, slabGrid, slabTop } from "@/lib/scene/isoLayout";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SKY_ID = "iso-sky";
const SLAB_EDGE = 18;
const SLAB_EDGE_SHADE = "#000000";
const SLAB_EDGE_OPACITY = 0.18;
const GRID_OPACITY = 0.35;
const GRID_WIDTH = 1;
const PILLAR_HALF_WIDTH = 6;
const TOP_LIGHT = "#ffffff";
const TOP_LIGHT_OPACITY = 0.45;
const BOX_SPACING = 380;
const BOX_SIZES = [26, 18, 34];
const BOX_COLORS = ["#f4a261", "#2a9d8f", "#e76f51"];
/** Boxes stand this many depth steps back on the slab, behind the pillars. */
const BOX_DEPTH_STEPS = 3;
const BOX_OFFSET = 0.45;
const RAIL_SIDE_WIDTH = 6;
const RAIL_TOP_WIDTH = 5;
const HALF = 2;

function Box({ x, ground, size, color, shade }: { x: number; ground: number; size: number; color: string; shade: string }): ReactElement {
  const faces = boxFaces(x, ground - size, ground, size / HALF);
  return (
    <g data-testid="iso-box">
      <polygon points={faces.side} fill={shade} />
      <polygon points={faces.front} fill={color} />
      <polygon points={faces.top} fill={color} />
      <polygon points={faces.top} fill={TOP_LIGHT} opacity={TOP_LIGHT_OPACITY} />
    </g>
  );
}

export function IsoBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette } = scene;
  const { width, height } = track;
  const ground = track.contentOffset + track.groundY;
  const boxBack = { x: DEPTH.x * BOX_DEPTH_STEPS, y: DEPTH.y * BOX_DEPTH_STEPS };
  const boxes = Array.from({ length: Math.max(1, Math.floor(width / BOX_SPACING)) }, (_, index) => (index + BOX_OFFSET) * BOX_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <g data-testid="iso-slab">
        <polygon points={slabTop(width, ground)} fill={palette.ground} />
        <g stroke={palette.steelDark} strokeWidth={GRID_WIDTH} opacity={GRID_OPACITY}>
          {slabGrid(width, ground).map(({ from, to }) => (
            <line key={`${from.x}-${from.y}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          ))}
        </g>
        <rect y={ground} width={width} height={SLAB_EDGE} fill={palette.ground} />
        <rect y={ground} width={width} height={SLAB_EDGE} fill={SLAB_EDGE_SHADE} opacity={SLAB_EDGE_OPACITY} />
      </g>
      {boxes.map((x, index) => (
        <Box
          key={x}
          x={x + boxBack.x}
          ground={ground + boxBack.y}
          size={BOX_SIZES[index % BOX_SIZES.length]}
          color={BOX_COLORS[index % BOX_COLORS.length]}
          shade={palette.steelDark}
        />
      ))}
    </g>
  );
}

export function IsoStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {track.supports.map(({ x, y }) => {
        const faces = boxFaces(x, y, track.groundY, PILLAR_HALF_WIDTH);
        return (
          <g key={`${x}-${y}`} data-testid="iso-pillar">
            <polygon points={faces.side} fill={palette.steelDark} />
            <polygon points={faces.front} fill={palette.steel} />
          </g>
        );
      })}
    </g>
  );
}

export function IsoRail({ path, palette }: RailProps): ReactElement {
  const [backmost, ...nearer] = railOffsets().slice(0, -1);
  return (
    <>
      <g fill="none" strokeWidth={RAIL_SIDE_WIDTH} strokeLinecap="round" strokeLinejoin="round" data-testid="iso-rail-depth">
        <path d={path} stroke={palette?.cloud} transform={`translate(${backmost.x} ${backmost.y})`} />
        {nearer.map(({ x, y }) => (
          <path key={`${x}-${y}`} d={path} stroke={palette?.steelDark} transform={`translate(${x} ${y})`} />
        ))}
      </g>
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_TOP_WIDTH} strokeLinecap="round" strokeLinejoin="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
