/**
 * Storybook world: a life drawn as a paper theatre in a picture book, one page for each chapter.
 * Stops hang on threads from the top of the page above cut-paper hills, clouds and trees, each with a paper shadow,
 * and the track is a stitched ribbon ridden by a paper aeroplane. All shapes are original and drawn in code.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import { garlandPoints, pageFolds, pennants, storyPages, threadsFor } from "@/lib/scene/storybookLayout";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const FOLD_ID = "storybook-fold";
/** A paper shadow is a darker copy of a shape, nudged down and right, so no filters are needed. */
const SHADOW = "#5c4b3b";
const SHADOW_OPACITY = 0.18;
const SHADOW_X = 5;
const SHADOW_Y = 6;
const FOLD_WIDTH = 44;
const HILL_SPACING = 300;
const HILL_LAYERS = [
  { lift: 120, rise: 70, key: "far" },
  { lift: 70, rise: 60, key: "middle" },
  { lift: 26, rise: 44, key: "front" },
] as const;
const TREE_SPACING = 230;
const TREE_COLORS = ["#6fbf73", "#f28fad", "#f6c85f"];
const PENNANT_FILLS = ["#d9483b", "#f2a65a", "#6fa8dc"];
/** How far the garland dips between two threads, and how far below the title strip it hangs. */
const GARLAND_SAG = 14;
const GARLAND_TOP = 10;

function Shadowed({ children }: { children: ReactElement }): ReactElement {
  return (
    <>
      <g transform={`translate(${SHADOW_X} ${SHADOW_Y})`} fill={SHADOW} opacity={SHADOW_OPACITY}>
        {children}
      </g>
      {children}
    </>
  );
}

function hillPath(width: number, ground: number, lift: number, rise: number, phase: number): string {
  const count = Math.ceil(width / HILL_SPACING) + 2;
  const base = ground - lift;
  const tops = Array.from({ length: count }, (_, index) => {
    const start = (index - phase) * HILL_SPACING;
    return `Q${start + HILL_SPACING / 2} ${base - rise} ${start + HILL_SPACING} ${base}`;
  });
  return `M${-phase * HILL_SPACING} ${ground} V${base} ${tops.join(" ")} V${ground} Z`;
}

function PaperCloud({ x, y, scale }: { x: number; y: number; scale: number }): ReactElement {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} data-testid="storybook-cloud">
      <circle cx={-26} cy={0} r={20} />
      <circle cx={0} cy={-12} r={26} />
      <circle cx={28} cy={0} r={18} />
      <rect x={-46} y={0} width={92} height={18} rx={9} />
    </g>
  );
}

function Tree({ x, ground, color }: { x: number; ground: number; color: string }): ReactElement {
  return (
    <g data-testid="storybook-tree">
      <rect x={x - 3} y={ground - 40} width={6} height={30} fill="#8a6a4a" />
      <circle cx={x} cy={ground - 52} r={20} fill={color} />
    </g>
  );
}

export function StorybookBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  /** The backdrop sits outside the title offset that the ride and its threads are drawn in. */
  const ground = track.groundY + track.contentOffset;
  const pages = storyPages(track.chapterBands, track.width);
  const hillColors = [palette.skylineFar, palette.skylineNear, palette.ground];
  const trees = Array.from({ length: Math.floor(track.width / TREE_SPACING) }, (_, index) => (index + 0.5) * TREE_SPACING);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={FOLD_ID} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHADOW} stopOpacity={0} />
          <stop offset="0.5" stopColor={SHADOW} stopOpacity={0.16} />
          <stop offset="1" stopColor={SHADOW} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={palette.skyTop} data-testid="scene-sky" />
      {pages.map(({ from, to, tint }) => (
        <rect key={from} x={from} width={to - from} height={track.height} fill={tint === 0 ? palette.skyTop : palette.skyBottom} data-testid="storybook-page" />
      ))}
      {scenery.orb && (
        <Shadowed>
          <circle cx={scenery.orb.x} cy={scenery.orb.y} r={scenery.orb.radius * 0.7} fill={palette.orb ?? palette.cart} />
        </Shadowed>
      )}
      {scenery.clouds.map(({ x, y, scale }) => (
        <g key={x} fill={palette.cloud}>
          <Shadowed>
            <PaperCloud x={x} y={y * 0.6 + 40} scale={scale} />
          </Shadowed>
        </g>
      ))}
      {HILL_LAYERS.map(({ lift, rise, key }, index) => (
        <g key={key} fill={hillColors[index]}>
          <Shadowed>
            <path d={hillPath(track.width, ground, lift, rise, index * 0.35)} />
          </Shadowed>
        </g>
      ))}
      {trees.map((x, index) => (
        <Tree key={x} x={x} ground={ground - HILL_LAYERS[1].lift + 18} color={TREE_COLORS[index % TREE_COLORS.length]} />
      ))}
      {pageFolds(pages).map((x) => (
        <rect key={x} x={x - FOLD_WIDTH / 2} width={FOLD_WIDTH} height={track.height} fill={`url(#${FOLD_ID})`} data-testid="storybook-fold" />
      ))}
    </g>
  );
}

function garlandPath(points: readonly number[]): string {
  const curves = points.slice(1).map((x, index) => `Q${(points[index] + x) / 2} ${GARLAND_TOP + GARLAND_SAG} ${x} ${GARLAND_TOP}`);
  return `M${points[0]} ${GARLAND_TOP} ${curves.join(" ")}`;
}

export function StorybookStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const threads = threadsFor(track.stops, GARLAND_TOP);
  const points = garlandPoints(threads, track.width);
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {threads.map(({ id, x, top, bottom }) => (
        <line key={id} x1={x} y1={top} x2={x} y2={bottom} stroke={palette.steel} strokeWidth={1.5} strokeDasharray="1 3" data-testid="storybook-thread" />
      ))}
      <path d={garlandPath(points)} fill="none" stroke={palette.steelDark} strokeWidth={1.5} data-testid="storybook-garland" />
      {pennants(points).map(({ x, color }) => (
        <path
          key={x}
          d={`M${x - 9} ${GARLAND_TOP + GARLAND_SAG / 2} L${x + 9} ${GARLAND_TOP + GARLAND_SAG / 2} L${x} ${GARLAND_TOP + GARLAND_SAG / 2 + 18} Z`}
          fill={PENNANT_FILLS[color]}
          data-testid="storybook-pennant"
        />
      ))}
    </g>
  );
}

export function StorybookRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={SHADOW} strokeOpacity={SHADOW_OPACITY} strokeWidth={8} strokeLinecap="round" transform={`translate(${SHADOW_X} ${SHADOW_Y})`} />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={8} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={palette?.pill} strokeWidth={1.5} strokeDasharray="6 6" className="ride-track-ties" />
    </>
  );
}

export function PaperPlane({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g transform="translate(0 -20)">
      <g transform="translate(-10 -26) scale(0.8)">
        <RiderArt rider={rider} />
      </g>
      <path d="M-50 -6 L54 -2 L-30 14 Z" fill={color} stroke="#5c4b3b" strokeWidth={2} strokeLinejoin="round" />
      <path d="M-30 14 L-14 2 L54 -2" fill="#e8dcc4" stroke="#5c4b3b" strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}
