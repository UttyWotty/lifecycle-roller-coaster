/**
 * Drawings of the characters who ride the cart, with their arms in the air.
 * Each one is centred on its head, so the cart and the picker can both place it.
 * All the art is original and drawn from simple shapes.
 */
import type { ReactElement } from "react";
import { type Rider } from "@/lib/scene/riders";

interface RiderArtProps {
  rider: Rider;
}

const OUTLINE = "#0f172a";
const OUTLINE_WIDTH = 1.5;
const EYE_RADIUS = 1.4;
const SKIN_YELLOW = "#facc15";
const CAT_ORANGE = "#fb923c";
const ROBOT_STEEL = "#94a3b8";
const ROBOT_LIGHT = "#22d3ee";
const ANTENNA_RED = "#ef4444";
const SUIT_WHITE = "#f8fafc";
const VISOR_BLUE = "#1e3a8a";
const DINO_GREEN = "#4ade80";
const DINO_SPIKE = "#16a34a";
const GHOST_WHITE = "#f1f5f9";

function Arms({ color }: { color: string }): ReactElement {
  return (
    <g stroke={color} strokeWidth={4} strokeLinecap="round">
      <line x1={-5} y1={11} x2={-15} y2={-14} />
      <line x1={5} y1={11} x2={15} y2={-14} />
    </g>
  );
}

function Eyes(): ReactElement {
  return (
    <g fill={OUTLINE}>
      <circle cx={-3.5} cy={-2} r={EYE_RADIUS} />
      <circle cx={3.5} cy={-2} r={EYE_RADIUS} />
    </g>
  );
}

function Smile(): ReactElement {
  return <path d="M-4 3 Q0 7 4 3" fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} strokeLinecap="round" />;
}

function Smiley(): ReactElement {
  return (
    <>
      <Arms color={SKIN_YELLOW} />
      <circle r={10} fill={SKIN_YELLOW} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <Eyes />
      <Smile />
    </>
  );
}

function Cat(): ReactElement {
  return (
    <>
      <Arms color={CAT_ORANGE} />
      <path d="M-10 -3 L-9 -13 L-3 -9 Z M10 -3 L9 -13 L3 -9 Z" fill={CAT_ORANGE} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} strokeLinejoin="round" />
      <circle r={10} fill={CAT_ORANGE} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <Eyes />
      <path d="M-1.5 1.5 H1.5 L0 3.5 Z" fill={OUTLINE} />
      <g stroke={OUTLINE} strokeWidth={1}>
        <line x1={-5} y1={3} x2={-12} y2={1} />
        <line x1={-5} y1={5} x2={-12} y2={6} />
        <line x1={5} y1={3} x2={12} y2={1} />
        <line x1={5} y1={5} x2={12} y2={6} />
      </g>
    </>
  );
}

function Robot(): ReactElement {
  return (
    <>
      <Arms color={ROBOT_STEEL} />
      <line x1={0} y1={-10} x2={0} y2={-16} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <circle cy={-17} r={2.5} fill={ANTENNA_RED} stroke={OUTLINE} strokeWidth={1} />
      <rect x={-10} y={-10} width={20} height={20} rx={3.5} fill={ROBOT_STEEL} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <rect x={-7} y={-5} width={14} height={5} rx={2} fill={ROBOT_LIGHT} stroke={OUTLINE} strokeWidth={1} />
      <path d="M-5 5 H5 M-2 3.5 V6.5 M1.5 3.5 V6.5" stroke={OUTLINE} strokeWidth={1.2} />
    </>
  );
}

function Astronaut(): ReactElement {
  return (
    <>
      <Arms color={SUIT_WHITE} />
      <circle r={11} fill={SUIT_WHITE} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <rect x={-7.5} y={-6} width={15} height={11} rx={5} fill={VISOR_BLUE} stroke={OUTLINE} strokeWidth={1} />
      <path d="M-4 -3 Q-2 -5 1 -4" fill="none" stroke={SUIT_WHITE} strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
}

function Dino(): ReactElement {
  return (
    <>
      <Arms color={DINO_GREEN} />
      <path d="M-9 -7 L-7 -14 L-3 -10 L0 -15 L3 -10 L7 -14 L9 -7 Z" fill={DINO_SPIKE} stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
      <ellipse rx={11} ry={10} fill={DINO_GREEN} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <Eyes />
      <path d="M-6 3 H6 L4 6 L2 4 L0 6 L-2 4 L-4 6 Z" fill={SUIT_WHITE} stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
    </>
  );
}

function Ghost(): ReactElement {
  return (
    <>
      <Arms color={GHOST_WHITE} />
      <path
        d="M-10 11 V-1 C-10 -14 10 -14 10 -1 V11 L6.5 8 L3.5 11 L0 8 L-3.5 11 L-6.5 8 Z"
        fill={GHOST_WHITE}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
      />
      <Eyes />
      <circle cy={3.5} r={2} fill={OUTLINE} />
    </>
  );
}

const RIDER_ART: Readonly<Record<Rider, () => ReactElement>> = {
  smiley: Smiley,
  cat: Cat,
  robot: Robot,
  astronaut: Astronaut,
  dino: Dino,
  ghost: Ghost,
};

export function RiderArt({ rider }: RiderArtProps): ReactElement {
  const Art = RIDER_ART[rider];
  return (
    <g data-rider={rider}>
      <Art />
    </g>
  );
}
