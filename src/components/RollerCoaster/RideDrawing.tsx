/**
 * The interactive ride drawing with its controls: Ride it and Fit to screen, with Sound, Music, Narrate, Non-stop and
 * Ride again folded away under Ride options so the row stays short.
 * It owns Ride it playback, laying the moving cart over the drawing and the story card under it.
 * While a ride runs, the stop the cart has reached is highlighted; otherwise the user's selection is.
 */
"use client";

import { useEffect, useRef, useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { FoldOut } from "@/components/FoldOut/FoldOut";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { PlaybackCart } from "@/components/Scene/PlaybackCart";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import type { Scene } from "@/lib/scene/composeRide";
import { pastStops } from "@/lib/track/futureStops";
import type { Curtain } from "@/lib/guess/guessGame";
import type { Track } from "@/lib/track/types";
import { railPathOf } from "./measureRail";
import { GuessCurtain } from "./GuessCurtain";
import { RideItPanel } from "./RideItPanel";
import { MIN_TRACK_SCALE, RideTrack } from "./RideTrack";
import { useRidePlayback } from "./useRidePlayback";
import { useNarrateRide, useNarration } from "./useNarration";
import { useNonStop } from "./useNonStop";
import { useRideMusic } from "./useRideMusic";
import { useRideSounds } from "./useRideSounds";
import type { DeviceChoice } from "./deviceChoice";

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
  /** Where the Ride options fold-out's open state lives: on the device for the user's own ride, or page-only. */
  rideOptions: DeviceChoice;
  /** Guess my ride's curtain, or null when no game is on; a game hides the ride's own controls. */
  curtain: Curtain | null;
}

const FIRST_RIDE = 0;
/** Where the curtain's edge sits across the visible part of the drawing during a game. */
const CURTAIN_VIEW_SHARE = 0.7;
/**
 * Hides the drawing's own carts on screen while Ride it draws its cart on top. Only page CSS hides them, so the
 * parked cart stays in the markup and an image exported during a ride matches one exported before it.
 */
const RIDING_CLASS = "ride-it-active";

export function RideDrawing(props: RideDrawingProps): ReactElement {
  const { track, scene, label, events, report, fitToScreen, selectedId, svgRef, onSelect, onFitToScreenChange, curtain, rideOptions } = props;
  const isGuessing = curtain !== null;
  const t = useT();
  const locale = useLocale();
  const [rideNumber, setRideNumber] = useState(FIRST_RIDE);
  const scroller = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const railPath = railPathOf(track);
  const hasCart = scene !== null && railPath !== null;
  const sounds = useRideSounds();
  const nonStop = useNonStop();
  const narration = useNarration();
  const ridePath = track.future?.pastRail ?? railPath;
  const playback = useRidePlayback({ track, railPath: hasCart ? ridePath : null, scroller, drawing, sound: sounds.player, isNonStop: nonStop.isOn });
  const isRiding = playback.status !== null;
  const music = useRideMusic(playback.status, scene?.palette.kind ?? null);
  const { silence } = sounds;

  useEffect(() => {
    if (!isRiding) {
      silence();
    }
  }, [isRiding, silence]);
  const ridingStop = playback.stopIndex === null ? null : track.stops[playback.stopIndex];
  const ridingEvent = events.find((event) => event.id === ridingStop?.id) ?? null;
  useNarrateRide({
    narration,
    status: playback.status,
    stopIndex: playback.stopIndex,
    stop: ridingEvent ?? ridingStop ?? null,
    stopCount: pastStops(track).length,
    locale,
  });
  const vehicle = scene && hasCart
    ? {
        Vehicle: sceneModeFor(scene.palette.kind).Vehicle,
        color: scene.palette.cart,
        rider: scene.rider,
        isMonochrome: scene.palette.kind === "line",
      }
    : null;

  /** Keeps the curtain's edge in view as a game moves along the ride. */
  const curtainX = curtain?.x ?? null;
  useEffect(() => {
    const box = scroller.current;
    const width = drawing.current?.clientWidth ?? 0;
    if (curtainX !== null && box && width > 0) {
      box.scrollTo({ left: curtainX * (width / track.width) - box.clientWidth * CURTAIN_VIEW_SHARE, behavior: "smooth" });
    }
  }, [curtainX, track.width]);

  /** Resizing the drawing mid-ride moves the page, so bring the drawing back once the new size is laid out. */
  function toggleFitToScreen(): void {
    onFitToScreenChange(!fitToScreen);
    if (isRiding) {
      requestAnimationFrame(() => drawing.current?.scrollIntoView({ block: "nearest" }));
    }
  }

  return (
    <>
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label={t("ride.drawingRegion")}
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
            onSelect={isGuessing ? undefined : onSelect}
            svgRef={svgRef}
          />
          {isRiding && <PlaybackCart track={track} cartRef={playback.cartRef} vehicle={vehicle} />}
          {curtain !== null && <GuessCurtain track={track} curtain={curtain} palette={scene?.palette ?? null} />}
        </div>
      </div>
      {playback.status !== null && (
        <RideItPanel
          status={playback.status}
          event={ridingEvent}
          stopNumber={(playback.stopIndex ?? 0) + 1}
          stopCount={pastStops(track).length}
          comingUp={track.future === null ? [] : track.stops.slice(track.future.fromIndex)}
          report={report}
          onTogglePause={playback.togglePause}
          onNext={playback.next}
          onBack={playback.back}
          onExit={playback.exit}
        />
      )}
      <div className={isGuessing ? "hidden" : "flex flex-wrap items-start gap-2"}>
        {!isRiding && (
          <button
            type="button"
            onClick={() => {
              sounds.prepare();
              music.prepare();
              playback.start();
            }}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
          >
            {t("ride.rideIt")}
          </button>
        )}
        <button
          type="button"
          aria-pressed={fitToScreen}
          onClick={toggleFitToScreen}
          className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
        >
          {t("ride.fitToScreen")}
        </button>
        <FoldOut label={t("ride.rideOptions")} choice={rideOptions} className="">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={sounds.isOn}
              onClick={sounds.toggle}
              className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
            >
              {t("ride.sound")}
            </button>
            <button
              type="button"
              aria-pressed={music.isOn}
              onClick={music.toggle}
              className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
            >
              {t("ride.music")}
            </button>
            {narration.isSupported && (
              <button
                type="button"
                aria-pressed={narration.isOn}
                onClick={narration.toggle}
                className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
              >
                {t("ride.narrate")}
              </button>
            )}
            <button
              type="button"
              aria-pressed={nonStop.isOn}
              onClick={nonStop.toggle}
              className={`${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`}
            >
              {t("ride.nonStop")}
            </button>
            {hasCart && !isRiding && (
              <button
                type="button"
                onClick={() => setRideNumber((number) => number + 1)}
                className={`${SECONDARY_BUTTON_CLASS} motion-reduce:hidden`}
              >
                {t("ride.rideAgain")}
              </button>
            )}
          </div>
        </FoldOut>
      </div>
    </>
  );
}
