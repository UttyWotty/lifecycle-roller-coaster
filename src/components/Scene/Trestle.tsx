/**
 * The steel structure that holds up the rail in illustrated themes.
 * A repeating cross-braced pattern fills the space under the track, with gaps showing the sky behind.
 * Heavier posts rise at each stop and at both ends, so the structure looks properly finished.
 */
import type { ReactElement } from "react";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";

interface TrestleProps {
  track: Track;
  palette: ScenePalette;
}

const LATTICE_ID = "ride-lattice";
const CELL_SIZE = 56;
const CELL_MIDDLE = CELL_SIZE / 2;
const BRACE_WIDTH = 3;
const POST_WIDTH = 5;
const RIVET_RADIUS = 3.5;
const PILLAR_WIDTH = 16;
const BEAM_WIDTH = 5;
const BEAM_DROP = 13;
const GROUND_HEIGHT = 14;

function pointList(points: Track["profile"]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

function LatticePattern({ palette }: { palette: ScenePalette }): ReactElement {
  return (
    <pattern id={LATTICE_ID} width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
      <g stroke={palette.steel} strokeWidth={BRACE_WIDTH}>
        <line x1={0} y1={0} x2={CELL_SIZE} y2={CELL_SIZE} />
        <line x1={CELL_SIZE} y1={0} x2={0} y2={CELL_SIZE} />
        <line x1={CELL_MIDDLE} y1={0} x2={CELL_MIDDLE} y2={CELL_SIZE} strokeWidth={POST_WIDTH} />
        <line x1={0} y1={CELL_MIDDLE} x2={CELL_SIZE} y2={CELL_MIDDLE} strokeWidth={POST_WIDTH} />
      </g>
      <circle cx={CELL_MIDDLE} cy={CELL_MIDDLE} r={RIVET_RADIUS} fill={palette.steelDark} />
    </pattern>
  );
}

export function Trestle({ track, palette }: TrestleProps): ReactElement | null {
  const { profile, groundY, stops, width } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const outline = pointList([
    { x: first.x, y: groundY },
    ...profile,
    { x: last.x, y: groundY },
  ]);
  return (
    <g aria-hidden="true" data-testid="trestle">
      <defs>
        <LatticePattern palette={palette} />
      </defs>
      <polygon points={outline} fill={`url(#${LATTICE_ID})`} />
      <polyline
        points={pointList(profile.map(({ x, y }) => ({ x, y: y + BEAM_DROP })))}
        fill="none"
        stroke={palette.steelDark}
        strokeWidth={BEAM_WIDTH}
      />
      {[...stops, first, last].map(({ x, y }) => (
        <rect
          key={x}
          x={x - PILLAR_WIDTH / 2}
          y={y}
          width={PILLAR_WIDTH}
          height={groundY - y}
          fill={palette.steel}
          stroke={palette.steelDark}
          strokeWidth={BRACE_WIDTH}
        />
      ))}
      <rect x={0} y={groundY - GROUND_HEIGHT} width={width} height={GROUND_HEIGHT} fill={palette.ground} />
    </g>
  );
}
