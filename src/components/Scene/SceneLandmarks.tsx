/**
 * Landmarks that give a theme its own place: a sun or moon, Ferris wheels and bats.
 * Each is drawn from simple shapes, and themes without them draw nothing.
 * They are decoration only, and the backdrop hides them from screen readers.
 */
import type { ReactElement } from "react";
import type { Bat, Orb, Wheel } from "@/lib/scene/buildScenery";
import type { ScenePalette, SceneryKind } from "@/lib/scene/themes";

const SPOKES = 8;
const FULL_TURN = Math.PI * 2;
const GONDOLA_RADIUS_SHARE = 0.11;
const SPOKE_WIDTH = 1.5;
const RIM_WIDTH = 4;
const LEG_WIDTH = 5;
const HUB_RADIUS = 6;
/** The wheel is a soft silhouette in the skyline colour, so it stays behind the steel and the labels. */
const WHEEL_OPACITY = 0.6;
const BAT_COLOR = "#0a0307";
const BAT_PATH =
  "M0 0 Q-6 -8 -12 -4 Q-20 -10 -28 -2 Q-20 -2 -16 4 Q-10 0 -6 6 Q-3 2 0 6 Q3 2 6 6 Q10 0 16 4 Q20 -2 28 -2 Q20 -10 12 -4 Q6 -8 0 0 Z";
const CRATER_OPACITY = 0.14;
const CRATERS = [
  { x: -0.3, y: -0.2, radius: 0.2 },
  { x: 0.28, y: 0.08, radius: 0.13 },
  { x: -0.08, y: 0.38, radius: 0.16 },
];

export function SceneOrb(props: { orb: Orb; color: string; kind: SceneryKind }): ReactElement {
  const { orb, color, kind } = props;
  return (
    <g transform={`translate(${orb.x} ${orb.y})`} data-testid="scene-orb">
      <circle r={orb.radius} fill={color} />
      {kind === "haunted" &&
        CRATERS.map(({ x, y, radius }) => (
          <circle
            key={x}
            cx={x * orb.radius}
            cy={y * orb.radius}
            r={radius * orb.radius}
            fill={BAT_COLOR}
            opacity={CRATER_OPACITY}
          />
        ))}
    </g>
  );
}

export function FerrisWheel(props: { wheel: Wheel; groundY: number; palette: ScenePalette }): ReactElement {
  const { wheel, groundY, palette } = props;
  const { x, y, radius } = wheel;
  const color = palette.skylineNear;
  const angles = Array.from({ length: SPOKES }, (_, index) => (index / SPOKES) * FULL_TURN);
  return (
    <g data-testid="scene-wheel" opacity={WHEEL_OPACITY} stroke={color} fill={color}>
      <g strokeWidth={LEG_WIDTH} strokeLinecap="round">
        <line x1={x} y1={y} x2={x - radius * 0.7} y2={groundY} />
        <line x1={x} y1={y} x2={x + radius * 0.7} y2={groundY} />
      </g>
      <g strokeWidth={SPOKE_WIDTH}>
        {angles.map((angle) => (
          <line key={angle} x1={x} y1={y} x2={x + Math.cos(angle) * radius} y2={y + Math.sin(angle) * radius} />
        ))}
      </g>
      <circle cx={x} cy={y} r={radius} fill="none" strokeWidth={RIM_WIDTH} />
      <circle cx={x} cy={y} r={HUB_RADIUS} stroke="none" />
      {angles.map((angle) => (
        <circle
          key={angle}
          cx={x + Math.cos(angle) * radius}
          cy={y + Math.sin(angle) * radius}
          r={radius * GONDOLA_RADIUS_SHARE}
          stroke="none"
        />
      ))}
    </g>
  );
}

export function BatShape({ bat }: { bat: Bat }): ReactElement {
  return (
    <path
      d={BAT_PATH}
      transform={`translate(${bat.x} ${bat.y}) scale(${bat.scale})`}
      fill={BAT_COLOR}
      data-testid="scene-bat"
    />
  );
}
