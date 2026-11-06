/**
 * Main result stage, where the user sees and adjusts their finished roller coaster.
 * The track is rebuilt from the events on every change, so adjustments show immediately.
 * It carries the reminder that the ride is a creative picture, not a measurement of a life.
 */
"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { ReadingNotes } from "@/components/RideFlow/ReadingNotes";
import { updateEvent } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";
import { composeRide } from "@/lib/scene/composeRide";
import type { RideTheme } from "@/lib/scene/themes";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import type { RideStyle } from "@/lib/track/types";
import { CategoryLegend } from "./CategoryLegend";
import { ExportButton } from "./ExportButton";
import { RideControls } from "./RideControls";
import { RideTrack } from "./RideTrack";
import { StopDetails } from "./StopDetails";

interface RideResultProps {
  events: readonly LifeEvent[];
  clarifications: readonly string[];
  isDemo: boolean;
  isSample: boolean;
  title: string;
  rideStyle: RideStyle;
  rideTheme: RideTheme;
  fitToScreen: boolean;
  onTitleChange: (title: string) => void;
  onRideStyleChange: (style: RideStyle) => void;
  onRideThemeChange: (theme: RideTheme) => void;
  onFitToScreenChange: (fitToScreen: boolean) => void;
  onEventsChange: (events: LifeEvent[]) => void;
  onEditEvents: () => void;
  onBackToStory: () => void;
  onShowAnotherSample: () => void;
}

const FIRST_RIDE = 0;
const SELECT_PROMPT = "Select a stop on the track to adjust how it felt and how much it mattered.";
const CREATIVE_NOTE = "This ride is a creative picture of your story, not a measurement of your life.";

export function RideResult(props: RideResultProps): ReactElement {
  const { events, clarifications, isDemo, isSample, title, rideStyle, rideTheme, fitToScreen } = props;
  const { onFitToScreenChange, onTitleChange, onRideStyleChange, onRideThemeChange, onEventsChange, onEditEvents, onBackToStory, onShowAnotherSample } = props;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [rideNumber, setRideNumber] = useState(FIRST_RIDE);
  const { track, scene } = useMemo(
    () => composeRide(events, { style: rideStyle, theme: rideTheme, title }),
    [events, rideStyle, rideTheme, title],
  );
  const hasCart = scene !== null && track.style !== "metro";
  const selected = events.find((event) => event.id === selectedId);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
          Your ride
        </h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onBackToStory} className={SECONDARY_BUTTON_CLASS}>
            Back to my story
          </button>
          <button type="button" onClick={onEditEvents} className={SECONDARY_BUTTON_CLASS}>
            Edit my events
          </button>
          {isSample && (
            <button type="button" onClick={onShowAnotherSample} className={SECONDARY_BUTTON_CLASS}>
              Show me another life
            </button>
          )}
        </div>
      </header>
      <ReadingNotes isDemo={isDemo} isSample={isSample} clarifications={clarifications} />
      <RideControls
        title={title}
        style={rideStyle}
        theme={rideTheme}
        onTitleChange={onTitleChange}
        onStyleChange={onRideStyleChange}
        onThemeChange={onRideThemeChange}
      />
      <div
        tabIndex={0}
        role="region"
        aria-label="Roller coaster, scrolls sideways on small screens"
        className="overflow-x-auto"
      >
        <RideTrack
          key={`${rideStyle}-${rideNumber}`}
          track={track}
          scene={scene}
          label={RIDE_STYLE_DETAILS[rideStyle].drawingLabel}
          fitToScreen={fitToScreen}
          selectedId={selectedId}
          onSelect={setSelectedId}
          svgRef={svg}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {hasCart && (
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
      <CategoryLegend events={events} />
      {selected ? (
        <StopDetails
          event={selected}
          onChange={(patch) => onEventsChange(updateEvent(events, selected.id, patch))}
        />
      ) : (
        <p className="text-sm">{SELECT_PROMPT}</p>
      )}
      <ExportButton svg={svg} width={track.width} height={track.height} />
      <p className="text-sm text-muted">{CREATIVE_NOTE}</p>
    </section>
  );
}
