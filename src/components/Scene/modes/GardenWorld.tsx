/**
 * Garden world: a life drawn as a growing vine, held up by garden canes over hills that change with the seasons.
 * Good moments bloom into flowers, hard ones grow thorns and calm ones sprout leaves, all bigger for bigger moments.
 * All shapes are original and built from the ride's own geometry, with placement from the pure gardenLayout module.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { bloomsFor, leafSpots, seasonBands, type Bloom, type Season } from "@/lib/scene/gardenLayout";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "garden-sky";
/** Hills behind, and the strip of grass along the ground, for each season. */
const SEASON_COLORS: Readonly<Record<Season, { hill: string; grass: string }>> = {
  spring: { hill: "#c8ecae", grass: "#8fd16a" },
  summer: { hill: "#a9d48a", grass: "#4f9a3a" },
  autumn: { hill: "#f2c98e", grass: "#d98b3a" },
  winter: { hill: "#e3edf2", grass: "#c9d8e0" },
};
const HILL_HEIGHT = 90;
const HILL_WAVE = 36;
const GRASS_HEIGHT = 16;
const LEAF_FILL = "#5aa33f";
const LEAF_EDGE = "#2f6b22";
const LEAF_PATH = "M0 0 Q15 -21 40 -5 Q20 8 0 0 Z";
const PETAL_COLORS = ["#ff8fb1", "#ffd23f", "#c58cff", "#ff9f5a"];
const PETAL_COUNT = 6;
const THORN_COUNT = 8;
const THORN_FILL = "#5b3a1e";
const CANE_WIDTH = 5;
const CANE_NODE_GAP = 46;
const CANE_TOP_GAP = 16;
const FULL_TURN = 360;

/** One rolling hill per season, starting and ending at the same height, so neighbouring seasons meet smoothly. */
function hillPath(from: number, to: number, ground: number): string {
  const edge = ground - HILL_HEIGHT + HILL_WAVE / 2;
  const middle = (from + to) / 2;
  return `M${from} ${ground} V${edge} Q${(from + middle) / 2} ${edge - HILL_WAVE} ${middle} ${edge} T${to} ${edge} V${ground} Z`;
}

export function GardenBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  /** The backdrop sits outside the title offset that the rail and structure are drawn in. */
  const ground = track.groundY + track.contentOffset;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      {scenery.orb && <circle cx={scenery.orb.x} cy={scenery.orb.y} r={scenery.orb.radius} fill={palette.orb ?? palette.cart} />}
      {scenery.clouds.map(({ x, y, scale }) => (
        <ellipse key={x} cx={x} cy={y * 0.6 + 24} rx={58 * scale} ry={16 * scale} fill={palette.cloud} />
      ))}
      {seasonBands(track.chapterBands, track.width).map(({ from, to, season }) => (
        <g key={from} data-testid={`garden-season-${season}`}>
          <path d={hillPath(from, to, ground)} fill={SEASON_COLORS[season].hill} />
          <rect x={from} y={ground - GRASS_HEIGHT} width={to - from} height={GRASS_HEIGHT} fill={SEASON_COLORS[season].grass} />
        </g>
      ))}
      <rect y={ground} width={track.width} height={Math.max(track.height - ground, 0)} fill={palette.ground} />
    </g>
  );
}

function Flower({ x, y, radius, color }: { x: number; y: number; radius: number; color: string }): ReactElement {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="garden-flower">
      {Array.from({ length: PETAL_COUNT }, (_, index) => (
        <ellipse
          key={index}
          cx={radius * 0.55}
          rx={radius * 0.5}
          ry={radius * 0.3}
          fill={color}
          stroke="#ffffff"
          strokeWidth={1.5}
          transform={`rotate(${(index * FULL_TURN) / PETAL_COUNT})`}
        />
      ))}
    </g>
  );
}

function Thorns({ x, y, radius }: { x: number; y: number; radius: number }): ReactElement {
  const inner = radius * 0.45;
  return (
    <g transform={`translate(${x} ${y})`} fill={THORN_FILL} data-testid="garden-thorns">
      <circle r={inner + 2} fill="none" stroke={THORN_FILL} strokeWidth={4} />
      {Array.from({ length: THORN_COUNT }, (_, index) => (
        <path key={index} d={`M${inner} -5 L${radius} 0 L${inner} 5 Z`} transform={`rotate(${(index * FULL_TURN) / THORN_COUNT + 22.5})`} />
      ))}
    </g>
  );
}

function Sprout({ x, y, radius }: { x: number; y: number; radius: number }): ReactElement {
  const scale = radius / 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={LEAF_FILL} stroke={LEAF_EDGE} strokeWidth={1.5} data-testid="garden-sprout">
      <path d={LEAF_PATH} transform="rotate(-135)" />
      <path d={LEAF_PATH} transform="rotate(-45)" />
    </g>
  );
}

function BloomArt({ bloom, index }: { bloom: Bloom; index: number }): ReactElement {
  if (bloom.shape === "flower") {
    return <Flower x={bloom.x} y={bloom.y} radius={bloom.radius} color={PETAL_COLORS[index % PETAL_COLORS.length]} />;
  }
  return bloom.shape === "thorns" ? <Thorns x={bloom.x} y={bloom.y} radius={bloom.radius} /> : <Sprout x={bloom.x} y={bloom.y} radius={bloom.radius} />;
}

function Cane({ x, top, ground, palette }: { x: number; top: number; ground: number; palette: ScenePalette }): ReactElement {
  const nodes = Array.from({ length: Math.max(Math.floor((ground - top) / CANE_NODE_GAP), 0) }, (_, index) => ground - (index + 1) * CANE_NODE_GAP);
  return (
    <g data-testid="garden-cane">
      <line x1={x} y1={ground} x2={x} y2={top} stroke={palette.steel} strokeWidth={CANE_WIDTH} strokeLinecap="round" />
      {nodes.map((y) => (
        <line key={y} x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={palette.steelDark} strokeWidth={2} />
      ))}
    </g>
  );
}

export function GardenStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { profile, stops, groundY } = track;
  const hasStem = track.style !== "metro" && profile.length > 0;
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {hasStem && stops.map(({ id, x, y }) => <Cane key={id} x={x} top={y + CANE_TOP_GAP} ground={groundY} palette={palette} />)}
      {hasStem && (
        <g fill={LEAF_FILL} stroke={LEAF_EDGE} strokeWidth={1.5}>
          {leafSpots(profile, stops).map(({ x, y, angle, side }) => (
            <path key={x} d={LEAF_PATH} transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${side === "up" ? 1 : -1})`} data-testid="garden-leaf" />
          ))}
        </g>
      )}
      {bloomsFor(stops).map((bloom, index) => (
        <BloomArt key={bloom.id} bloom={bloom} index={index} />
      ))}
    </g>
  );
}

export function GardenRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={9} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke="#7fbf5c" strokeWidth={3} strokeLinecap="round" className="ride-track-ties" />
    </>
  );
}

export function Ladybug({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g>
      <g stroke="#1f2937" strokeWidth={3} strokeLinecap="round">
        <line x1={-24} y1={-6} x2={-30} y2={4} />
        <line x1={0} y1={-4} x2={0} y2={6} />
        <line x1={24} y1={-6} x2={30} y2={4} />
      </g>
      <g transform="translate(-6 -44)">
        <RiderArt rider={rider} />
      </g>
      <circle cx={40} cy={-16} r={11} fill="#1f2937" />
      <path d="M44 -26 Q48 -36 54 -36 M38 -26 Q38 -36 44 -38" fill="none" stroke="#1f2937" strokeWidth={2} />
      <ellipse cx={0} cy={-18} rx={40} ry={18} fill={color} stroke="#1f2937" strokeWidth={2} />
      <line x1={0} y1={-36} x2={0} y2={0} stroke="#1f2937" strokeWidth={2} />
      <g fill="#1f2937">
        <circle cx={-20} cy={-22} r={5} />
        <circle cx={-12} cy={-8} r={4} />
        <circle cx={18} cy={-24} r={5} />
        <circle cx={14} cy={-8} r={4} />
      </g>
    </g>
  );
}
