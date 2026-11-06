/**
 * The cart that rides the track, with a passenger holding their arms up.
 * On screen it follows the real rail once, through every loop, and parks at the end of the track.
 * Exports and reduced-motion users see only the parked cart, because the page styles decide which shows.
 */
import type { ReactElement } from "react";
import { EXPORT_HIDDEN_ATTRIBUTE } from "@/lib/export/rideImage";
import type { TrackPoint } from "@/lib/track/types";

interface RideCartProps {
  path: string;
  parkedAt: TrackPoint;
  stopCount: number;
  color: string;
}

const SECONDS_PER_STOP = 1.3;
const SHORTEST_RIDE_SECONDS = 5;
const WHEEL_COLOR = "#1f2937";
const WHEEL_HUB_COLOR = "#e5e7eb";
const SKIN_COLOR = "#facc15";
const OUTLINE_COLOR = "#0f172a";
const BODY_PATH = "M-30 -10 V-28 Q-30 -36 -23 -30 L-10 -17 H12 Q22 -30 30 -23 Q35 -17 31 -10 Z";
const WHEEL_POSITIONS = [-20, -7, 7, 20];

function CartArt({ color }: { color: string }): ReactElement {
  return (
    <>
      <g stroke={SKIN_COLOR} strokeWidth={4} strokeLinecap="round">
        <line x1={-8} y1={-24} x2={-17} y2={-48} />
        <line x1={2} y1={-24} x2={11} y2={-48} />
      </g>
      <circle cx={-3} cy={-34} r={9} fill={SKIN_COLOR} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
      <circle cx={0} cy={-36} r={1.3} fill={OUTLINE_COLOR} />
      <circle cx={-6} cy={-36} r={1.3} fill={OUTLINE_COLOR} />
      <path d="M-7 -31 Q-3 -27 1 -31" fill="none" stroke={OUTLINE_COLOR} strokeWidth={1.5} strokeLinecap="round" />
      <path d={BODY_PATH} fill={color} stroke={OUTLINE_COLOR} strokeWidth={2} strokeLinejoin="round" />
      {WHEEL_POSITIONS.map((x) => (
        <g key={x}>
          <circle cx={x} cy={-6} r={6} fill={WHEEL_COLOR} />
          <circle cx={x} cy={-6} r={2.2} fill={WHEEL_HUB_COLOR} />
        </g>
      ))}
    </>
  );
}

export function RideCart({ path, parkedAt, stopCount, color }: RideCartProps): ReactElement {
  const seconds = Math.max(SHORTEST_RIDE_SECONDS, stopCount * SECONDS_PER_STOP);
  return (
    <g aria-hidden="true">
      <g className="ride-cart-moving" data-testid="ride-cart-moving" {...{ [EXPORT_HIDDEN_ATTRIBUTE]: true }}>
        <animateMotion path={path} dur={`${seconds}s`} rotate="auto" fill="freeze" />
        <CartArt color={color} />
      </g>
      <g
        className="ride-cart-parked"
        data-testid="ride-cart-parked"
        transform={`translate(${parkedAt.x} ${parkedAt.y})`}
      >
        <CartArt color={color} />
      </g>
    </g>
  );
}
