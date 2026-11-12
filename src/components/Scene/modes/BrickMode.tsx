/**
 * Building blocks: a life built as a toy-brick model on a studded green baseplate, like a set on a bright table.
 * The rail runs on a ladder of grey ties over columns of stacked bricks, brick trees and clouds stand around it, and a
 * studded brick cart carries the rider. All shapes are generic toy bricks drawn in code, after no brand or product.
 */
import type { ReactElement } from "react";
import { BRICK_HEIGHT, brickColumn, brickTrees } from "@/lib/scene/brickLayout";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "brick-sky";
const BRICK_WIDTH = 26;
const BRICK_EDGE = 1.5;
const STUD_WIDTH = 8;
const STUD_HEIGHT = 4;
const STUD_GAP = 3;
const SHADE = "#000000";
const SHADE_OPACITY = 0.14;
const SHINE = "#ffffff";
const SHINE_OPACITY = 0.35;
const PLATE_HEIGHT = 18;
const PLATE_STUD_SPACING = 20;
const TREE_TRUNK = "#8a5a2b";
const TREE_LEAF = "#2e9e48";
const TREE_BRICK_WIDTH = 46;
const TREE_STEP = 12;
const CLOUD_BRICK_WIDTH = 34;
const CLOUD_SKY_SHARE = 0.55;
const RAIL_SHADE_WIDTH = 10;
const RAIL_WIDTH = 7;
const RAIL_SHINE_WIDTH = 2;
const RAIL_SHINE_LIFT = -2;
const TIE_WIDTH = 16;
const TIE_DASHES = "4 10";
const TIE_COLOR = "#9aa0a6";
const HALF = 2;

/** One side-on brick with two studs on top; shade and shine give it a moulded edge. */
function BrickShape({ x, y, width, color, studs = true }: { x: number; y: number; width: number; color: string; studs?: boolean }): ReactElement {
  const studLeft = x + width / HALF - STUD_WIDTH - STUD_GAP / HALF;
  return (
    <g>
      {studs && (
        <g fill={color} stroke={SHADE} strokeOpacity={SHADE_OPACITY} strokeWidth={BRICK_EDGE}>
          <rect x={studLeft} y={y - STUD_HEIGHT} width={STUD_WIDTH} height={STUD_HEIGHT} />
          <rect x={studLeft + STUD_WIDTH + STUD_GAP} y={y - STUD_HEIGHT} width={STUD_WIDTH} height={STUD_HEIGHT} />
        </g>
      )}
      <rect x={x} y={y} width={width} height={BRICK_HEIGHT} fill={color} stroke={SHADE} strokeOpacity={SHADE_OPACITY} strokeWidth={BRICK_EDGE} />
      <rect x={x + BRICK_EDGE} y={y + BRICK_EDGE} width={width - BRICK_EDGE * HALF} height={BRICK_EDGE} fill={SHINE} opacity={SHINE_OPACITY} />
    </g>
  );
}

function Tree({ x, ground, layers }: { x: number; ground: number; layers: number }): ReactElement {
  return (
    <g data-testid="brick-tree">
      <BrickShape x={x - BRICK_WIDTH / HALF / HALF} y={ground - BRICK_HEIGHT} width={BRICK_WIDTH / HALF} color={TREE_TRUNK} studs={false} />
      {Array.from({ length: layers }, (_, layer) => {
        const width = TREE_BRICK_WIDTH + (layers - 1 - layer) * TREE_STEP * HALF;
        return <BrickShape key={layer} x={x - width / HALF} y={ground - BRICK_HEIGHT * (layer + HALF)} width={width} color={TREE_LEAF} studs={layer === layers - 1} />;
      })}
    </g>
  );
}

function BrickCloud({ x, y, color }: { x: number; y: number; color: string }): ReactElement {
  return (
    <g data-testid="brick-cloud">
      <BrickShape x={x - CLOUD_BRICK_WIDTH} y={y} width={CLOUD_BRICK_WIDTH * HALF} color={color} />
      <BrickShape x={x - CLOUD_BRICK_WIDTH * 1.5} y={y + BRICK_HEIGHT} width={CLOUD_BRICK_WIDTH * 3} color={color} />
    </g>
  );
}

export function BrickBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
  const ground = track.contentOffset + track.groundY;
  const studs = Array.from({ length: Math.ceil(width / PLATE_STUD_SPACING) }, (_, index) => index * PLATE_STUD_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      {scenery.clouds.map(({ x, y }) => (
        <BrickCloud key={x} x={x} y={y * CLOUD_SKY_SHARE} color={palette.cloud} />
      ))}
      {brickTrees(width).map(({ x, layers }) => (
        <Tree key={x} x={x} ground={ground} layers={layers} />
      ))}
      <g data-testid="brick-baseplate">
        <rect y={ground} width={width} height={Math.max(PLATE_HEIGHT, height - ground)} fill={palette.ground} />
        <g fill={palette.ground} stroke={SHADE} strokeOpacity={SHADE_OPACITY} strokeWidth={BRICK_EDGE}>
          {studs.map((x) => (
            <rect key={x} x={x + STUD_GAP} y={ground - STUD_HEIGHT} width={STUD_WIDTH} height={STUD_HEIGHT} />
          ))}
        </g>
      </g>
    </g>
  );
}

export function BrickStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const colors = [palette.steel, palette.steelDark];
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {track.supports.map(({ x, y }) => (
        <g key={`${x}-${y}`} data-testid="brick-column">
          {brickColumn(y, track.groundY).map((brick, index) => (
            <BrickShape key={brick.y} x={x - BRICK_WIDTH / HALF} y={brick.y} width={BRICK_WIDTH} color={colors[brick.tint]} studs={index === 0} />
          ))}
        </g>
      ))}
    </g>
  );
}

export function BrickRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={TIE_COLOR} strokeWidth={TIE_WIDTH} strokeDasharray={TIE_DASHES} />
      <path d={path} fill="none" stroke={SHADE} strokeOpacity={SHADE_OPACITY * HALF} strokeWidth={RAIL_SHADE_WIDTH} strokeLinejoin="round" />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} strokeLinejoin="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={SHINE} strokeOpacity={SHINE_OPACITY} strokeWidth={RAIL_SHINE_WIDTH} transform={`translate(0 ${RAIL_SHINE_LIFT})`} />
    </>
  );
}

/** A studded brick cart with black wheels, carrying the rider. */
export function BrickCart({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g data-testid="brick-cart">
      <g transform="translate(-4 -44)">
        <RiderArt rider={rider} />
      </g>
      <BrickShape x={-34} y={-30} width={68} color={color} />
      <BrickShape x={-34} y={-16} width={68} color={color} studs={false} />
      <circle cx={-20} cy={-2} r={6} fill="#1f2937" />
      <circle cx={20} cy={-2} r={6} fill="#1f2937" />
    </g>
  );
}
