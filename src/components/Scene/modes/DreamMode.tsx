/**
 * Dreamland: a life drawn as a puffy balloon ride floating on clouds, under soft rainbows and twinkling sparkles.
 * The rail is a glossy inflated tube on pastel legs with round feet, and a smiling jelly cart carries the rider.
 * Every shape is original and drawn in code, with white highlights for the soft sheen and no outside art.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { cloudFloor, rainbows } from "@/lib/scene/dreamLayout";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "dream-sky";
const RAINBOW_COLORS = ["#ffb3c7", "#ffd6a5", "#fdffb6", "#caffbf", "#a0e7ff", "#cdb4ff"];
const RAINBOW_BAND = 12;
const RAINBOW_OPACITY = 0.55;
const SPARKLE = "M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9 Z";
const SPARKLE_FILLS = ["#ffffff", "#ffe08a", "#ffc6e0"];
const CLOUD_SHADE = "#f3e8ff";
const CLOUD_SHADE_DROP = 8;
const SKY_CLOUD_HEIGHT_SHARE = 0.7;
const LEG_WIDTH = 12;
const FOOT_RADIUS = 10;
const LEG_SHINE_WIDTH = 3;
const LEG_SHINE_OPACITY = 0.6;
const LEG_SHINE_OFFSET = -3;
const TUBE_EDGE_WIDTH = 22;
const TUBE_WIDTH = 17;
const TUBE_PINCHES = "2 30";
const TUBE_PINCH_OPACITY = 0.25;
const TUBE_EDGE = "#e0609a";
const TUBE_SHINE_WIDTH = 4;
const TUBE_SHINE_LIFT = -4;
const TUBE_SHINE_OPACITY = 0.75;
const SHINE = "#ffffff";

function PuffyCloud({ x, y, scale }: { x: number; y: number; scale: number }): ReactElement {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} data-testid="dream-cloud">
      <g fill={CLOUD_SHADE} transform={`translate(0 ${CLOUD_SHADE_DROP})`}>
        <circle cx={-26} cy={0} r={18} />
        <circle cx={0} cy={-10} r={24} />
        <circle cx={26} cy={0} r={18} />
      </g>
      <g fill="#ffffff">
        <circle cx={-26} cy={0} r={18} />
        <circle cx={0} cy={-10} r={24} />
        <circle cx={26} cy={0} r={18} />
      </g>
    </g>
  );
}

export function DreamBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
  const horizon = track.contentOffset + track.groundY;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      {rainbows(width, horizon).map(({ x, radius }) => (
        <g key={x} fill="none" strokeWidth={RAINBOW_BAND} opacity={RAINBOW_OPACITY} data-testid="dream-rainbow">
          {RAINBOW_COLORS.map((color, band) => {
            const r = radius - band * RAINBOW_BAND;
            return <path key={color} d={`M${x - r} ${horizon} A${r} ${r} 0 0 1 ${x + r} ${horizon}`} stroke={color} />;
          })}
        </g>
      ))}
      {scenery.stars.map(({ x, y }, index) => (
        <path key={`${x}-${y}`} d={SPARKLE} transform={`translate(${x} ${y})`} fill={SPARKLE_FILLS[index % SPARKLE_FILLS.length]} data-testid="dream-sparkle" />
      ))}
      {scenery.clouds.map(({ x, y, scale }) => (
        <PuffyCloud key={x} x={x} y={y * SKY_CLOUD_HEIGHT_SHARE} scale={scale} />
      ))}
      <rect y={horizon} width={width} height={Math.max(0, height - horizon)} fill={palette.ground} />
      <g data-testid="dream-cloud-floor">
        {cloudFloor(width).map(({ x, radius }) => (
          <g key={x}>
            <circle cx={x} cy={horizon + CLOUD_SHADE_DROP} r={radius} fill={CLOUD_SHADE} />
            <circle cx={x} cy={horizon} r={radius} fill="#ffffff" />
          </g>
        ))}
      </g>
    </g>
  );
}

export function DreamStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const { supports, groundY } = track;
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {supports.map(({ x, y }) => (
        <g key={`${x}-${y}`}>
          <line x1={x} y1={y} x2={x} y2={groundY} stroke={palette.steel} strokeWidth={LEG_WIDTH} strokeLinecap="round" />
          <line x1={x + LEG_SHINE_OFFSET} y1={y} x2={x + LEG_SHINE_OFFSET} y2={groundY - FOOT_RADIUS} stroke={SHINE} strokeWidth={LEG_SHINE_WIDTH} strokeLinecap="round" opacity={LEG_SHINE_OPACITY} />
          <circle cx={x} cy={groundY} r={FOOT_RADIUS} fill={palette.steel} />
        </g>
      ))}
    </g>
  );
}

export function DreamRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={TUBE_EDGE} strokeWidth={TUBE_EDGE_WIDTH} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={TUBE_WIDTH} strokeLinecap="round" strokeLinejoin="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
      <path d={path} fill="none" stroke={TUBE_EDGE} strokeWidth={TUBE_WIDTH} strokeDasharray={TUBE_PINCHES} opacity={TUBE_PINCH_OPACITY} />
      <path d={path} fill="none" stroke={SHINE} strokeWidth={TUBE_SHINE_WIDTH} strokeLinecap="round" opacity={TUBE_SHINE_OPACITY} transform={`translate(0 ${TUBE_SHINE_LIFT})`} />
    </>
  );
}

/** A smiling jelly cart: a soft rounded body with a face at the front and the rider on top. */
export function JellyCart({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g data-testid="dream-cart">
      <g transform="translate(-6 -40)">
        <RiderArt rider={rider} />
      </g>
      <path d="M-34 -6 Q-38 -30 -14 -32 H18 Q38 -32 36 -12 Q34 -2 22 -2 H-26 Q-33 -2 -34 -6 Z" fill={color} stroke="#c2417a" strokeWidth={2} />
      <ellipse cx={-14} cy={-24} rx={10} ry={3} fill={SHINE} opacity={TUBE_SHINE_OPACITY} />
      <circle cx={20} cy={-18} r={2.4} fill="#3b2a4a" />
      <circle cx={30} cy={-18} r={2.4} fill="#3b2a4a" />
      <path d="M21 -12 Q25 -8 29 -12" fill="none" stroke="#3b2a4a" strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={16} cy={-12} r={3} fill="#ff8fb8" opacity={0.7} />
      <circle cx={33} cy={-12} r={3} fill="#ff8fb8" opacity={0.7} />
    </g>
  );
}
