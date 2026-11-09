/**
 * The two drawings of a ride together, stacked in one sideways-scrolling area so their years line up.
 * During Ride together each drawing carries its own cart overlay, and the moment each person is at is highlighted.
 * Both drawings have the same width, so one scroll position fits both.
 */
import type { ReactElement, RefObject } from "react";
import { MIN_TRACK_SCALE, RideTrack } from "@/components/RollerCoaster/RideTrack";
import { PlaybackCart } from "@/components/Scene/PlaybackCart";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { ComposedRide } from "@/lib/scene/composeRide";

interface TogetherDrawingsProps {
  rides: readonly [ComposedRide, ComposedRide];
  names: readonly [string, string];
  highlighted: readonly [string | null, string | null];
  isRiding: boolean;
  cartRefs: readonly [RefObject<SVGGElement | null>, RefObject<SVGGElement | null>];
  scroller: RefObject<HTMLDivElement | null>;
  drawing: RefObject<HTMLDivElement | null>;
}

const RIDING_CLASS = "ride-it-active";

export function TogetherDrawings(props: TogetherDrawingsProps): ReactElement {
  const { rides, names, highlighted, isRiding, cartRefs, scroller, drawing } = props;
  const width = rides[0].track.width;
  return (
    <div
      ref={scroller}
      tabIndex={0}
      role="region"
      aria-label="Two rides on one timeline, scrolls sideways on small screens"
      className="overflow-x-auto"
    >
      <div ref={drawing} className="flex flex-col gap-2" style={{ minWidth: width * MIN_TRACK_SCALE }}>
        {rides.map(({ track, scene }, index) => (
          <div key={names[index] + String(index)} className={isRiding ? `relative ${RIDING_CLASS}` : "relative"}>
            <RideTrack track={track} scene={scene} label={`${names[index]}, as a roller coaster`} selectedId={highlighted[index]} />
            {isRiding && (
              <PlaybackCart
                track={track}
                cartRef={cartRefs[index]}
                vehicle={
                  scene
                    ? {
                        Vehicle: sceneModeFor(scene.palette.kind).Vehicle,
                        color: scene.palette.cart,
                        rider: scene.rider,
                        isMonochrome: scene.palette.kind === "line",
                      }
                    : null
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
