/**
 * Comic Book Mode: a life drawn as a comic strip, with bright panels, halftone dots and thick black ink.
 * Each chapter is a panel with a white gutter in the palette's sky colour, big climbs and drops get POW and WOW bursts in the sky, and every label
 * is a speech bubble pointing at its stop. All shapes are original, flat colours drawn in code with no outside art.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { BURST_HALF_WIDTH, BURST_WORDS, comicBursts, comicPanels, type ComicBurst } from "@/lib/scene/comicLayout";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const DOTS_ID = "comic-dots";
const DOT_CELL = 10;
const DOT_RADIUS = 1.8;
const DOT_OPACITY = 0.14;
const PANEL_FILLS = ["#ffe14d", "#7fd6f5", "#ff9ec7", "#a8e66b"];
const GUTTER = 14;
const INK_WIDTH = 4;
const GROUND_LINE_WIDTH = 4;
/** The bursts' band of sky, above every flag and loop, measured up from the top of the track. */
const BURST_SKY_Y = -100;
const BURST_HALF_HEIGHT = 22;
const BURST_POINTS = 14;
const BURST_INNER_SHARE = 0.72;
const BURST_FILLS = { drop: "#ff5a36", climb: "#ffffff" } as const;
const BURST_WORD_SIZE = 17;
const BURST_WORD_DROP = 6;
const BURST_TILT = [-8, 6, -4];
const POST_INK_WIDTH = 9;
const POST_WIDTH = 5;
const RAIL_INK_WIDTH = 13;
const RAIL_WIDTH = 7;
const RAIL_SHINE_WIDTH = 2;
const RAIL_SHINE_DASHES = "14 10";
const RAIL_SHINE_LIFT = -2;
const RAIL_SHINE = "#ffffff";
/** How far a speech bubble's tail reaches toward its stop, and how wide it is where it leaves the bubble. */
const TAIL_REACH = 16;
const TAIL_BASE = 14;
const TAIL_OVERLAP = 3;
const BUBBLE_INK_WIDTH = 3;
const HALF = 2;

function burstOutline(): string {
  return Array.from({ length: BURST_POINTS * HALF }, (_, index) => {
    const angle = (index / (BURST_POINTS * HALF)) * Math.PI * HALF;
    const share = index % HALF === 0 ? 1 : BURST_INNER_SHARE;
    return `${(Math.cos(angle) * BURST_HALF_WIDTH * share).toFixed(1)},${(Math.sin(angle) * BURST_HALF_HEIGHT * share).toFixed(1)}`;
  }).join(" ");
}

const BURST_OUTLINE = burstOutline();

function Burst({ burst, y, ink }: { burst: ComicBurst; y: number; ink: string }): ReactElement {
  const tilt = BURST_TILT[burst.word % BURST_TILT.length];
  return (
    <g transform={`translate(${burst.x} ${y}) rotate(${tilt})`} data-testid="comic-burst" data-mood={burst.mood}>
      <polygon points={BURST_OUTLINE} fill={BURST_FILLS[burst.mood]} stroke={ink} strokeWidth={INK_WIDTH} strokeLinejoin="round" />
      <text y={BURST_WORD_DROP} textAnchor="middle" fontSize={BURST_WORD_SIZE} fontWeight={900} fontStyle="italic" fill={ink}>
        {BURST_WORDS[burst.mood][burst.word]}
      </text>
    </g>
  );
}

export function ComicBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette } = scene;
  const { width, height } = track;
  const horizon = track.contentOffset + track.groundY;
  const panels = comicPanels(track.chapterBands, track.stops, width);
  const bursts = comicBursts(track.stops);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <pattern id={DOTS_ID} width={DOT_CELL} height={DOT_CELL} patternUnits="userSpaceOnUse">
          <circle cx={DOT_CELL / HALF} cy={DOT_CELL / HALF} r={DOT_RADIUS} fill={palette.ink} opacity={DOT_OPACITY} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={palette.skyTop} data-testid="scene-sky" />
      {panels.map(({ from, to, tint }) => (
        <g key={from} data-testid="comic-panel">
          <rect x={from + GUTTER / HALF} y={GUTTER / HALF} width={to - from - GUTTER} height={height - GUTTER} fill={PANEL_FILLS[tint]} />
          <rect x={from + GUTTER / HALF} y={GUTTER / HALF} width={to - from - GUTTER} height={height - GUTTER} fill={`url(#${DOTS_ID})`} stroke={palette.ink} strokeWidth={INK_WIDTH} />
        </g>
      ))}
      <rect y={horizon} width={width} height={height - horizon} fill={palette.ground} />
      <line x1={0} y1={horizon} x2={width} y2={horizon} stroke={palette.ink} strokeWidth={GROUND_LINE_WIDTH} />
      {bursts.map((burst) => (
        <Burst key={burst.id} burst={burst} y={track.contentOffset + BURST_SKY_Y} ink={palette.ink} />
      ))}
    </g>
  );
}

export function ComicStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { supports, groundY } = track;
  return (
    <g aria-hidden="true" data-testid="mode-structure" strokeLinecap="round">
      <g stroke={palette.ink} strokeWidth={POST_INK_WIDTH}>
        {supports.map(({ x, y }) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={groundY} />
        ))}
      </g>
      <g stroke={palette.steel} strokeWidth={POST_WIDTH}>
        {supports.map(({ x, y }) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={groundY} />
        ))}
      </g>
    </g>
  );
}

export function ComicRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={palette?.ink} strokeWidth={RAIL_INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} strokeLinecap="round" strokeLinejoin="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={RAIL_SHINE} strokeWidth={RAIL_SHINE_WIDTH} strokeDasharray={RAIL_SHINE_DASHES} transform={`translate(0 ${RAIL_SHINE_LIFT})`} />
    </>
  );
}

interface BubbleTailProps {
  /** The stop the bubble speaks for. */
  stopX: number;
  stopY: number;
  pillTop: number;
  pillHeight: number;
  palette: ScenePalette;
}

/** A speech bubble's tail, from the edge of a label nearest its stop, pointing at the stop. */
export function ComicBubbleTail({ stopX, stopY, pillTop, pillHeight, palette }: BubbleTailProps): ReactElement {
  const isAbove = pillTop + pillHeight <= stopY;
  const edge = isAbove ? pillTop + pillHeight - TAIL_OVERLAP : pillTop + TAIL_OVERLAP;
  const tip = isAbove ? edge + TAIL_REACH : edge - TAIL_REACH;
  const left = stopX - TAIL_BASE / HALF;
  const right = stopX + TAIL_BASE / HALF;
  return (
    <path
      d={`M${left} ${edge} L${stopX - TAIL_BASE / (HALF * HALF)} ${tip} L${right} ${edge}`}
      fill={palette.pill}
      stroke={palette.ink}
      strokeWidth={BUBBLE_INK_WIDTH}
      strokeLinejoin="round"
      data-testid="comic-bubble-tail"
    />
  );
}
