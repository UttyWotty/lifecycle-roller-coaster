/**
 * River trip world: a life drawn as a canoe trip down a river through green banks, under a warm afternoon sky.
 * Steep stretches run as white-water rapids with a splash below each big drop, and calm stretches carry lily pads.
 * All shapes are original and built from the ride's own geometry, with placement from the pure riverLayout module.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { lilyPads, rapidRuns, reedSpots, splashes, spraySpots } from "@/lib/scene/riverLayout";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track, TrackPoint } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "river-sky";
const BANK_ID = "river-bank-shade";
/** River details are drawn at this size, so spray, pads and reeds read at a glance. */
const DETAIL_SCALE = 1.6;
const HILL_SPACING = 260;
const HILL_HEIGHTS = [70, 110, 90];
const TREE_SPACING = 190;
const FOAM = "#ffffff";
const PAD_FILL = "#4caf50";
const PAD_EDGE = "#2e7d32";
const REED_STEM = "#5b7f2c";
const REED_HEAD = "#7a4a21";
/** Spray and pads sit on the water's top edge, half above the ribbon, so they show over it. */
const SURFACE_LIFT = 9;
const WATER_WIDTH = 18;

function points(list: readonly TrackPoint[]): string {
  return list.map(({ x, y }) => `${x},${y}`).join(" ");
}

function hillsPath(width: number, ground: number, lift: number): string {
  const count = Math.ceil(width / HILL_SPACING) + 1;
  const tops = Array.from({ length: count }, (_, index) => `Q${index * HILL_SPACING + HILL_SPACING / 2} ${ground - HILL_HEIGHTS[index % HILL_HEIGHTS.length] - lift} ${(index + 1) * HILL_SPACING} ${ground - lift}`);
  return `M0 ${ground} V${ground - lift} ${tops.join(" ")} V${ground} Z`;
}

function Tree({ x, ground }: { x: number; ground: number }): ReactElement {
  return (
    <g data-testid="river-tree">
      <rect x={x - 4} y={ground - 46} width={8} height={30} fill="#7a4a21" />
      <circle cx={x} cy={ground - 58} r={24} fill="#4f8f3a" />
      <circle cx={x - 12} cy={ground - 48} r={16} fill="#5fa046" />
    </g>
  );
}

export function RiverBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  /** The backdrop sits outside the title offset that the river and its banks are drawn in. */
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
      {scenery.orb && <circle cx={scenery.orb.x} cy={scenery.orb.y} r={scenery.orb.radius * 0.8} fill={palette.orb ?? palette.cart} />}
      {scenery.clouds.map(({ x, y, scale }) => (
        <g key={x}>
          <ellipse cx={x} cy={y * 0.6 + 24} rx={60 * scale} ry={15 * scale} fill={palette.cloud} />
          <path d={`M${x + 70} ${y * 0.6 + 60} l8 6 l8 -6 M${x + 92} ${y * 0.6 + 50} l6 5 l6 -5`} fill="none" stroke="#3b4a5a" strokeWidth={2} data-testid="river-bird" />
        </g>
      ))}
      <path d={hillsPath(track.width, ground, 60)} fill={palette.skylineFar} />
      <path d={hillsPath(track.width, ground, 20)} fill={palette.skylineNear} />
    </g>
  );
}

function Spray({ x, y, angle }: { x: number; y: number; angle: number }): ReactElement {
  return (
    <path
      d="M-8 0 Q-4 -8 0 -2 Q4 -10 8 0"
      transform={`translate(${x} ${y - SURFACE_LIFT}) rotate(${angle}) scale(${DETAIL_SCALE})`}
      fill="none"
      stroke={FOAM}
      strokeWidth={3.5}
      strokeLinecap="round"
      data-testid="river-spray"
    />
  );
}

function Splash({ x, y }: { x: number; y: number }): ReactElement {
  return (
    <g transform={`translate(${x} ${y - SURFACE_LIFT}) scale(${DETAIL_SCALE})`} fill={FOAM} data-testid="river-splash">
      <path d="M-26 0 Q-20 -22 -10 -6 Q0 -30 10 -6 Q20 -22 26 0 Z" opacity={0.9} />
      <circle cx={-18} cy={-30} r={3} />
      <circle cx={2} cy={-40} r={4} />
      <circle cx={20} cy={-32} r={3} />
    </g>
  );
}

function LilyPad({ x, y }: { x: number; y: number }): ReactElement {
  return (
    <g transform={`translate(${x} ${y - SURFACE_LIFT}) scale(${DETAIL_SCALE})`} data-testid="river-lily-pad">
      <path d="M0 0 L14 -3 A15 7 0 1 1 14 3 Z" fill={PAD_FILL} stroke={PAD_EDGE} strokeWidth={1.5} />
      <circle cx={-4} cy={-4} r={3} fill="#f9a8d4" />
    </g>
  );
}

function Reed({ x, y }: { x: number; y: number }): ReactElement {
  return (
    <g transform={`translate(${x} ${y}) scale(${DETAIL_SCALE})`} data-testid="river-reeds">
      <line x1={0} y1={4} x2={1} y2={-22} stroke={REED_STEM} strokeWidth={1.5} />
      <rect x={-1.5} y={-26} width={4} height={9} rx={2} fill={REED_HEAD} />
    </g>
  );
}

export function RiverStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, stops, groundY, width } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const bank = points([{ x: 0, y: groundY }, { x: 0, y: first.y }, ...profile, { x: width, y: last.y }, { x: width, y: groundY }]);
  const runs = rapidRuns(profile);
  const pads = lilyPads(profile, stops);
  const top = Math.min(...profile.map(({ y }) => y));
  const trees = Array.from({ length: Math.floor(width / TREE_SPACING) }, (_, index) => (index + 0.5) * TREE_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <defs>
        <linearGradient id={BANK_ID} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={groundY}>
          <stop offset="0" stopColor={palette.steel} />
          <stop offset="1" stopColor={palette.steelDark} />
        </linearGradient>
      </defs>
      <polygon points={bank} fill={`url(#${BANK_ID})`} data-testid="river-bank" />
      {trees.map((x) => (
        <Tree key={x} x={x} ground={groundY} />
      ))}
      {reedSpots(pads, stops).map(({ x, y }) => (
        <Reed key={`reed-${x}`} x={x} y={y} />
      ))}
      {spraySpots(runs, stops).map(({ x, y, angle }) => (
        <Spray key={`${x}-${y}`} x={x} y={y} angle={angle} />
      ))}
      {splashes(runs, stops).map(({ x, y }) => (
        <Splash key={`splash-${x}`} x={x} y={y} />
      ))}
      {pads.map(({ x, y }) => (
        <LilyPad key={`pad-${x}`} x={x} y={y} />
      ))}
    </g>
  );
}

export function RiverRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={WATER_WIDTH} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke="#a5dcf7" strokeWidth={3} strokeLinecap="round" strokeDasharray="14 18" className="ride-track-ties" />
    </>
  );
}

export function Canoe({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g>
      <line x1={-30} y1={-46} x2={18} y2={8} stroke="#7a4a21" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={20} cy={10} rx={5} ry={10} fill="#7a4a21" transform="rotate(-40 20 10)" />
      <g transform="translate(-10 -40)">
        <RiderArt rider={rider} />
      </g>
      <path d="M-56 -16 Q-30 4 0 4 Q30 4 56 -16 Q30 -8 0 -8 Q-30 -8 -56 -16 Z" fill={color} stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
      <path d="M-40 -10 Q0 -4 40 -10" fill="none" stroke="#fde68a" strokeWidth={2} />
    </g>
  );
}
