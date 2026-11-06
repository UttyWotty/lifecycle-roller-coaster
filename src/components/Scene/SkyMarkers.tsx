/**
 * The balloon and parachute that float beside the best and hardest moments.
 * A balloon lifts off at the high point, and a parachute makes for a soft landing at the low one.
 * Both are decoration only and are hidden from screen readers.
 */
import type { ReactElement } from "react";
import type { Scenery } from "@/lib/scene/buildScenery";
import type { ScenePalette } from "@/lib/scene/themes";
import type { TrackPoint } from "@/lib/track/types";

interface SkyMarkersProps {
  scenery: Scenery;
  palette: ScenePalette;
}

const BASKET_COLOR = "#92400e";
const BALLOON_STRIPE_COLOR = "#fde68a";
const CANOPY_STRIPE_COLOR = "#ffffff";
const ROPE_WIDTH = 1.5;

/** Ropes must show against the sky, and poster titles are pale over a pale band. */
function ropeColor(palette: ScenePalette): string {
  return palette.kind === "poster" ? palette.ink : palette.title;
}

function Balloon({ at, palette }: { at: TrackPoint; palette: ScenePalette }): ReactElement {
  return (
    <g transform={`translate(${at.x} ${at.y})`} data-testid="sky-balloon">
      <path d="M-34 0 C-34 -52 34 -52 34 0 C34 22 12 36 7 48 H-7 C-12 36 -34 22 -34 0 Z" fill={palette.steel} />
      <path d="M-12 -33 C-20 -10 -10 30 -5 48 H5 C10 30 20 -10 12 -33 C6 -37 -6 -37 -12 -33 Z" fill={BALLOON_STRIPE_COLOR} />
      <g stroke={ropeColor(palette)} strokeWidth={ROPE_WIDTH}>
        <line x1={-6} y1={48} x2={-6} y2={58} />
        <line x1={6} y1={48} x2={6} y2={58} />
      </g>
      <rect x={-8} y={58} width={16} height={12} rx={2} fill={BASKET_COLOR} />
    </g>
  );
}

function Parachute({ at, palette }: { at: TrackPoint; palette: ScenePalette }): ReactElement {
  return (
    <g transform={`translate(${at.x} ${at.y})`} data-testid="sky-parachute">
      <path d="M-46 0 C-40 -44 40 -44 46 0 Q23 -12 0 0 Q-23 -12 -46 0 Z" fill={palette.cart} />
      <path d="M-14 -30 C-20 -18 -22 -8 -23 -6 Q-11 -9 0 0 Q11 -9 23 -6 C22 -8 20 -18 14 -30 C6 -33 -6 -33 -14 -30 Z" fill={CANOPY_STRIPE_COLOR} opacity={0.6} />
      <g stroke={ropeColor(palette)} strokeWidth={ROPE_WIDTH}>
        <line x1={-46} y1={0} x2={0} y2={52} />
        <line x1={-20} y1={-5} x2={0} y2={52} />
        <line x1={20} y1={-5} x2={0} y2={52} />
        <line x1={46} y1={0} x2={0} y2={52} />
      </g>
      <circle cx={0} cy={56} r={5} fill={ropeColor(palette)} />
      <rect x={-4} y={60} width={8} height={12} rx={3} fill={ropeColor(palette)} />
    </g>
  );
}

export function SkyMarkers({ scenery, palette }: SkyMarkersProps): ReactElement {
  return (
    <g aria-hidden="true">
      {scenery.balloon && <Balloon at={scenery.balloon} palette={palette} />}
      {scenery.parachute && <Parachute at={scenery.parachute} palette={palette} />}
    </g>
  );
}
