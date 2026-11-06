/**
 * The cart that rides the track, carrying the character the person chose.
 * On screen it follows the real rail once, through every loop, and parks at the end of the track.
 * Exports and reduced-motion users see only the parked cart, because the page styles decide which shows.
 */
import type { ReactElement } from "react";
import { EXPORT_HIDDEN_ATTRIBUTE } from "@/lib/export/rideImage";
import type { Rider } from "@/lib/scene/riders";
import type { TrackPoint } from "@/lib/track/types";
import { RiderArt } from "./RiderArt";

interface RideCartProps {
  path: string;
  parkedAt: TrackPoint;
  stopCount: number;
  color: string;
  rider: Rider;
}

const SECONDS_PER_STOP = 1.3;
const SHORTEST_RIDE_SECONDS = 5;
const WHEEL_COLOR = "#1f2937";
const WHEEL_HUB_COLOR = "#e5e7eb";
const OUTLINE_COLOR = "#0f172a";
const BODY_PATH = "M-30 -10 V-28 Q-30 -36 -23 -30 L-10 -17 H12 Q22 -30 30 -23 Q35 -17 31 -10 Z";
const WHEEL_POSITIONS = [-20, -7, 7, 20];
const RIDER_POSITION = "translate(-3 -35)";
const CART_SCALE = 1.25;

function CartArt({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g transform={`scale(${CART_SCALE})`}>
      <g transform={RIDER_POSITION}>
        <RiderArt rider={rider} />
      </g>
      <path d={BODY_PATH} fill={color} stroke={OUTLINE_COLOR} strokeWidth={2} strokeLinejoin="round" />
      {WHEEL_POSITIONS.map((x) => (
        <g key={x}>
          <circle cx={x} cy={-6} r={6} fill={WHEEL_COLOR} />
          <circle cx={x} cy={-6} r={2.2} fill={WHEEL_HUB_COLOR} />
        </g>
      ))}
    </g>
  );
}

export function RideCart({ path, parkedAt, stopCount, color, rider }: RideCartProps): ReactElement {
  const seconds = Math.max(SHORTEST_RIDE_SECONDS, stopCount * SECONDS_PER_STOP);
  return (
    <g aria-hidden="true">
      <g className="ride-cart-moving" data-testid="ride-cart-moving" {...{ [EXPORT_HIDDEN_ATTRIBUTE]: true }}>
        <animateMotion path={path} dur={`${seconds}s`} rotate="auto" fill="freeze" />
        <CartArt color={color} rider={rider} />
      </g>
      <g
        className="ride-cart-parked"
        data-testid="ride-cart-parked"
        transform={`translate(${parkedAt.x} ${parkedAt.y})`}
      >
        <CartArt color={color} rider={rider} />
      </g>
    </g>
  );
}
