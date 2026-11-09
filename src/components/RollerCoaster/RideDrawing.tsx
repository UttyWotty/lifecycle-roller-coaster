/**
 * The interactive ride drawing with its controls: Ride it, Ride again and Fit to screen.
 * It owns Ride it playback, laying the moving cart over the drawing and the story card under it.
 * While a ride runs, the stop the cart has reached is highlighted; otherwise the user's selection is.
 */
"use client";

import { useRef, useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { PlaybackCart } from "@/components/Scene/PlaybackCart";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import type { Scene } from "@/lib/scene/composeRide";
import type { Track } from "@/lib/track/types";
import { RideItPanel } from "./RideItPanel";
import { MIN_TRACK_SCALE, RideTrack } from "./RideTrack";
import { useRidePlayback } from "./useRidePlayback";

interface RideDrawingProps {
  track: Track;
  scene: Scene | null;
  label: string;
  events: readonly LifeEvent[];
  report: LifeReport | null;
  fitToScreen: boolean;
  selectedId: string | null;
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: (id: string) => void;
  onFitToScreenChange: (fitToScreen: boolean) => void;
}

const FIRST_RIDE = 0;
/**
 * Hides the drawing's own carts on screen while Ride it draws its cart on top. Only page CSS hides them, so the
 * parked cart stays in the markup and an image exported during a ride matches one exported before it.
 */
const RIDING_CLASS = "ride-it-active";

export function RideDrawing(props: RideDrawingProps): ReactElement {
  const { track, scene, label, events, report, fitToScreen, selectedId, svgRef, onSelect, onFitToScreenChange } = props;
  const [rideNumber, setRideNumber] = useState(FIRST_RIDE);
  const scroller = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const rail = track.lines.find(({ category }) => category === null) ?? null;
  const hasCart = scene !== null && rail !== null;
  const playback = useRidePlayback({ track, railPath: hasCart ? rail.path : null, scroller, drawing });
  const isRiding = playback.status !== null;
  const ridingStop = playback.stopIndex === null ? null : track.stops[playback.stopIndex];
  const ridingEvent = events.find((event) => event.id === ridingStop?.id) ?? null;
  const vehicle = scene && hasCart
    ? {
        Vehicle: sceneModeFor(scene.palette.kind).Vehicle,
        color: scene.palette.cart,
        rider: scene.rider,
        isMonochrome: scene.palette.kind === "line",
      }
    : null;

  return (
    <>
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Roller coaster, scrolls sideways on small screens"
        className="overflow-x-auto lg:scroll-mt-36"
      >
        <div
          ref={drawing}
          className={isRiding ? `relative ${RIDING_CLASS}` : "relative"}
          style={fitToScreen ? undefined : { minWidth: track.width * MIN_TRACK_SCALE }}
        >
          <RideTrack
            key={`${track.style}-${rideNumber}`}
            track={track}
            scene={scene}
            label={label}
            fitToScreen={fitToScreen}
            selectedId={isRiding ? (ridingStop?.id ?? null) : selectedId}
            onSelect={onSelect}
            svgRef={svgRef}
          />
          {isRiding && <PlaybackCart track={track} cartRef={playback.cartRef} vehicle={vehicle} />}
        </div>
      </div>
      {playback.status !== null && (
        <RideItPanel
          status={playback.status}
          event={ridingEvent}
          stopNumber={(playback.stopIndex ?? 0) + 1}
          stopCount={track.stops.length}
          report={report}
          onTogglePause={playback.togglePause}
          onNext={playback.next}
          onBack={playback.back}
          onExit={playback.exit}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {!isRiding && (
          <button
            type="button"
            onClick={playback.start}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
          >
            Ride it
          </button>
        )}
        {hasCart && !isRiding && (
          <button
            type="button"
            onClick={() => setRideNumber((number) => number + 1)}
            className={`${SECONDARY_BUTTON_CLASS} motion-reduce:hidden`}
          >
            Ride again
          </button>
        )}
        <button
          type="button"
          aria-pressed={fitToScreen}
          onClick={() => onFitToScreenChange(!fitToScreen)}
          className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
        >
          Fit to screen
        </button>
      </div>
    </>
  );
}
