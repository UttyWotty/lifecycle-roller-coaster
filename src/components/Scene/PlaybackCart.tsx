/**
 * Transparent layer over the ride drawing that carries the cart during Ride it.
 * It shares the drawing's viewBox and content offset, so the cart lines up with the rail at any size.
 * The playback hook moves the cart directly each frame, so this layer never redraws the scene.
 */
import type { ComponentType, ReactElement, RefObject } from "react";
import type { Track } from "@/lib/track/types";
import type { VehicleProps } from "./RideCart";

interface PlaybackCartProps {
  track: Track;
  cartRef: RefObject<SVGGElement | null>;
  vehicle: VehicleProps & { Vehicle: ComponentType<VehicleProps>; isMonochrome: boolean } | null;
}

const MONOCHROME_STYLE = { filter: "grayscale(1)" };

export function PlaybackCart({ track, cartRef, vehicle }: PlaybackCartProps): ReactElement {
  return (
    <svg
      viewBox={`0 0 ${track.width} ${track.height}`}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      data-testid="playback-layer"
    >
      <g transform={`translate(0 ${track.contentOffset})`}>
        {vehicle && (
          <g ref={cartRef} data-testid="playback-cart" style={vehicle.isMonochrome ? MONOCHROME_STYLE : undefined}>
            <vehicle.Vehicle color={vehicle.color} rider={vehicle.rider} />
          </g>
        )}
      </g>
    </svg>
  );
}
