/**
 * The drawings of a ride together, stacked in one sideways-scrolling area so their years line up.
 * During Ride together each drawing carries its own cart overlay, and the moment each person is at is highlighted.
 * All drawings have the same width, so one scroll position fits them all.
 */
import type { ReactElement, RefObject } from "react";
import { useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
import { MIN_TRACK_SCALE, RideTrack } from "@/components/RollerCoaster/RideTrack";
import { PlaybackCart } from "@/components/Scene/PlaybackCart";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { ComposedRide } from "@/lib/scene/composeRide";

interface TogetherDrawingsProps {
  rides: readonly ComposedRide[];
  names: readonly string[];
  highlighted: readonly (string | null)[];
  isRiding: boolean;
  cartRefs: readonly RefObject<SVGGElement | null>[];
  scroller: RefObject<HTMLDivElement | null>;
  drawing: RefObject<HTMLDivElement | null>;
}

const RIDING_CLASS = "ride-it-active";
/** How many rides are shown, in words, for the drawing area's accessible name. */
const COUNT_WORDS: Readonly<Record<number, MessageKey>> = { 2: "together.countTwo", 3: "together.countThree", 4: "together.countFour" };

export function TogetherDrawings(props: TogetherDrawingsProps): ReactElement {
  const { rides, names, highlighted, isRiding, cartRefs, scroller, drawing } = props;
  const t = useT();
  const countWord = COUNT_WORDS[rides.length];
  const width = rides[0].track.width;
  return (
    <div
      ref={scroller}
      tabIndex={0}
      role="region"
      aria-label={t("together.drawings", { count: countWord === undefined ? rides.length : t(countWord) })}
      className="overflow-x-auto"
    >
      <div ref={drawing} className="flex flex-col gap-2" style={{ minWidth: width * MIN_TRACK_SCALE }}>
        {rides.map(({ track, scene }, index) => (
          <div key={names[index] + String(index)} className={isRiding ? `relative ${RIDING_CLASS}` : "relative"}>
            <RideTrack track={track} scene={scene} label={t("together.drawingLabel", { name: names[index] })} selectedId={highlighted[index]} />
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
