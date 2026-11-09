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
import type { LifeChapter, LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { WHOLE_LIFE, applyLens, availableLenses } from "@/lib/lenses/rideLenses";
import { composeRide } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import type { RideTheme } from "@/lib/scene/themes";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import type { RideStyle } from "@/lib/track/types";
import { CategoryLegend } from "./CategoryLegend";
import { ShareLinkPanel } from "@/components/Share/ShareLinkPanel";
import { ExportButton } from "./ExportButton";
import { LifeReportPanel } from "./LifeReportPanel";
import { LifeStatsPanel } from "./LifeStatsPanel";
import { RideControls } from "./RideControls";
import { RideLensPicker } from "./RideLensPicker";
import { RideLookBar } from "./RideLookBar";
import { RideDrawing } from "./RideDrawing";
import { SavedRideNote } from "./SavedRideNote";
import { StopDetails } from "./StopDetails";

interface RideResultProps {
  events: readonly LifeEvent[];
  clarifications: readonly string[];
  isDemo: boolean;
  isSample: boolean;
  /** The user's own ride, kept on this device, which Start over can delete. */
  isSavedOnDevice: boolean;
  title: string;
  rideStyle: RideStyle;
  rideTheme: RideTheme;
  chapters: readonly LifeChapter[];
  report: LifeReport | null;
  rider: Rider;
  fitToScreen: boolean;
  rideLens: string;
  birthYear: number | null;
  onRideLensChange: (lens: string) => void;
  onBirthYearChange: (birthYear: number | null) => void;
  onTitleChange: (title: string) => void;
  onRideStyleChange: (style: RideStyle) => void;
  onRideThemeChange: (theme: RideTheme) => void;
  onRiderChange: (rider: Rider) => void;
  onFitToScreenChange: (fitToScreen: boolean) => void;
  onEventsChange: (events: LifeEvent[]) => void;
  onEditEvents: () => void;
  onBackToStory: () => void;
  onShowAnotherSample: () => void;
  onStartOver: () => void;
}

const SELECT_PROMPT = "Select a stop on the track to adjust how it felt and how much it mattered.";
const CREATIVE_NOTE = "This ride is a creative picture of your story, not a measurement of your life.";

export function RideResult(props: RideResultProps): ReactElement {
  const { events, clarifications, isDemo, isSample, isSavedOnDevice, title, rideStyle, rideTheme, chapters, report, rider, fitToScreen, rideLens, birthYear } = props;
  const { onFitToScreenChange, onTitleChange, onRideStyleChange, onRideThemeChange, onRiderChange, onEventsChange, onEditEvents, onBackToStory, onShowAnotherSample, onStartOver, onRideLensChange, onBirthYearChange } = props;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const lenses = useMemo(() => availableLenses(events, birthYear), [events, birthYear]);
  const lens = lenses.find((option) => option.id === rideLens) ?? null;
  const lensEvents = useMemo(
    () => (lens ? applyLens(events, lens.id, birthYear) : events),
    [events, lens, birthYear],
  );
  /** A ride the user has not named takes its lens's title, ready for sharing. */
  const drawingTitle = title.trim() === "" && lens ? lens.title : title;
  const { track, scene } = useMemo(
    () => composeRide(lensEvents, { style: rideStyle, theme: rideTheme, title: drawingTitle, rider, chapters }),
    [lensEvents, rideStyle, rideTheme, drawingTitle, rider, chapters],
  );
  const hasCart = scene !== null && track.style !== "metro";
  const selected = events.find((event) => event.id === selectedId);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="flex flex-col gap-4">
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
        {isSavedOnDevice && <SavedRideNote onStartOver={onStartOver} />}
      </header>
      <ReadingNotes isDemo={isDemo} isSample={isSample} clarifications={clarifications} />
      <RideLookBar
        style={rideStyle}
        theme={rideTheme}
        onStyleChange={onRideStyleChange}
        onThemeChange={onRideThemeChange}
      />
      <RideDrawing
        track={track}
        scene={scene}
        label={RIDE_STYLE_DETAILS[rideStyle].drawingLabel}
        events={events}
        report={report}
        fitToScreen={fitToScreen}
        selectedId={selectedId}
        svgRef={svg}
        onSelect={setSelectedId}
        onFitToScreenChange={onFitToScreenChange}
      />
      <RideLensPicker
        lenses={lenses}
        activeId={lens?.id ?? WHOLE_LIFE}
        birthYear={birthYear}
        onLensChange={onRideLensChange}
        onBirthYearChange={onBirthYearChange}
      />
      {scene?.palette.kind !== "line" && <CategoryLegend events={lensEvents} />}
      {selected ? (
        <StopDetails
          event={selected}
          onChange={(patch) => onEventsChange(updateEvent(events, selected.id, patch))}
        />
      ) : (
        <p className="text-sm">{SELECT_PROMPT}</p>
      )}
      <RideControls
        title={title}
        rider={rider}
        hasCart={hasCart}
        onTitleChange={onTitleChange}
        onRiderChange={onRiderChange}
      />
      <ExportButton svg={svg} width={track.width} height={track.height} />
      <ShareLinkPanel
        ride={{ title: drawingTitle, style: rideStyle, theme: rideTheme, rider, events: lensEvents, chapters }}
      />
      {report && <LifeReportPanel report={report} isSample={isSample} />}
      <LifeStatsPanel events={lensEvents} />
      <p className="text-sm text-muted">{CREATIVE_NOTE}</p>
    </section>
  );
}
