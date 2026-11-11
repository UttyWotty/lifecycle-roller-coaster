/**
 * Main result stage, where the user sees and adjusts their finished roller coaster.
 * The track is rebuilt from the events on every change, so adjustments show immediately.
 * It carries the reminder that the ride is a creative picture, not a measurement of a life. Extras start folded away
 * (Edit, Ride options, Make it yours, Share, statistics), so at a glance people see their ride and Ride it.
 */
"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { FoldOut } from "@/components/FoldOut/FoldOut";
import { FOLD_OUTS } from "@/components/FoldOut/foldOutChoices";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { ReadingNotes } from "@/components/RideFlow/ReadingNotes";
import { updateEvent } from "@/lib/events/editing";
import type { LifeChapter, LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { WHOLE_LIFE, applyLens, availableLenses } from "@/lib/lenses/rideLenses";
import { composeRide } from "@/lib/scene/composeRide";
import { splitFuture } from "@/lib/track/futureStops";
import type { Rider } from "@/lib/scene/riders";
import type { RideTheme } from "@/lib/scene/themes";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";
import { CategoryLegend } from "./CategoryLegend";
import { ShareLinkPanel } from "@/components/Share/ShareLinkPanel";
import { RideTogetherInvite } from "@/components/Together/TogetherEntry";
import { ExportButton } from "./ExportButton";
import { storyDrawingOf } from "./storyImage";
import { LifeReportPanel } from "./LifeReportPanel";
import { LifeStatsPanel } from "./LifeStatsPanel";
import { RideControls } from "./RideControls";
import { RideLensPicker } from "./RideLensPicker";
import { RideLookBar } from "./RideLookBar";
import { RideDrawing } from "./RideDrawing";
import { SavedRideNote } from "./SavedRideNote";
import { RideVideoButton } from "./RideVideoButton";
import { StopDetails } from "./StopDetails";
import { useToday } from "./useToday";

/** Ids of the two parts Make it yours shows: the look bar above the drawing and the personal choices below it. */
const LOOK_BAR_ID = "make-it-yours-look";
const LOOK_DETAILS_ID = "make-it-yours-details";

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
  /** Adds a stop dated next year and opens it for editing, for something the user is looking forward to. */
  onAddFutureStop: () => void;
  onBackToStory: () => void;
  onShowAnotherSample: () => void;
  onStartOver: () => void;
}

export function RideResult(props: RideResultProps): ReactElement {
  const { events, clarifications, isDemo, isSample, isSavedOnDevice, title, rideStyle, rideTheme, chapters, report, rider, fitToScreen, rideLens, birthYear } = props;
  const { onFitToScreenChange, onTitleChange, onRideStyleChange, onRideThemeChange, onRiderChange, onEventsChange, onEditEvents, onAddFutureStop, onBackToStory, onShowAnotherSample, onStartOver, onRideLensChange, onBirthYearChange } = props;
  const t = useT();
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isOn: isLookOpen, toggle: toggleLook } = FOLD_OUTS.makeItYours.useChoice();
  const heading = useRef<HTMLHeadingElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const lenses = useMemo(() => availableLenses(events, birthYear, locale), [events, birthYear, locale]);
  const lens = lenses.find((option) => option.id === rideLens) ?? null;
  const lensEvents = useMemo(
    () => (lens ? applyLens(events, lens.id, birthYear) : events),
    [events, lens, birthYear],
  );
  /** A ride the user has not named takes its lens's title, ready for sharing. */
  const drawingTitle = title.trim() === "" && lens ? lens.title : title;
  const shareable = { title: drawingTitle, style: rideStyle, theme: rideTheme, rider, events: lensEvents, chapters };
  const today = useToday();
  const { track, scene } = useMemo(
    () => composeRide(lensEvents, { style: rideStyle, theme: rideTheme, title: drawingTitle, rider, chapters, today }),
    [lensEvents, rideStyle, rideTheme, drawingTitle, rider, chapters, today],
  );
  const happened = useMemo(() => splitFuture(lensEvents, today).past, [lensEvents, today]);
  const hasCart = scene !== null && track.style !== "metro";
  const selected = events.find((event) => event.id === selectedId);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
          {t("ride.heading")}
        </h1>
        <div className="flex flex-wrap items-start gap-2">
          <FoldOut label={t("ride.editMenu")} choice={FOLD_OUTS.edit} className="">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onEditEvents} className={SECONDARY_BUTTON_CLASS}>
                {t("ride.editEvents")}
              </button>
              <button type="button" onClick={onAddFutureStop} className={SECONDARY_BUTTON_CLASS}>
                {t("ride.addFutureStop")}
              </button>
              <button type="button" onClick={onBackToStory} className={SECONDARY_BUTTON_CLASS}>
                {t("review.backToStory")}
              </button>
            </div>
          </FoldOut>
          <button
            type="button"
            aria-expanded={isLookOpen}
            aria-controls={isLookOpen ? `${LOOK_BAR_ID} ${LOOK_DETAILS_ID}` : undefined}
            onClick={toggleLook}
            className={`${SECONDARY_BUTTON_CLASS} font-semibold aria-expanded:border-accent`}
          >
            {t("ride.makeItYours")}
          </button>
          {isSample && (
            <button type="button" onClick={onShowAnotherSample} className={SECONDARY_BUTTON_CLASS}>
              {t("ride.anotherSample")}
            </button>
          )}
        </div>
        {isSavedOnDevice && <SavedRideNote onStartOver={onStartOver} />}
      </header>
      <ReadingNotes isDemo={isDemo} isSample={isSample} clarifications={clarifications} />
      {isLookOpen && (
        <div id={LOOK_BAR_ID} className="contents">
          <RideLookBar
            style={rideStyle}
            styles={RIDE_STYLES}
            theme={rideTheme}
            onStyleChange={onRideStyleChange}
            onThemeChange={onRideThemeChange}
          />
        </div>
      )}
      <RideDrawing
        track={track}
        scene={scene}
        label={t(`look.${rideStyle}Drawing`)}
        events={events}
        report={report}
        fitToScreen={fitToScreen}
        selectedId={selectedId}
        svgRef={svg}
        onSelect={setSelectedId}
        onFitToScreenChange={onFitToScreenChange}
        curtain={null}
        rideOptions={FOLD_OUTS.rideOptions}
      />
      {scene?.palette.kind !== "line" && <CategoryLegend events={lensEvents} />}
      {selected ? (
        <StopDetails
          event={selected}
          onChange={(patch) => onEventsChange(updateEvent(events, selected.id, patch))}
        />
      ) : (
        <p className="text-sm">{t("ride.selectPrompt")}</p>
      )}
      {isLookOpen && (
        <div id={LOOK_DETAILS_ID} className="flex flex-col gap-4 rounded-3xl border border-muted p-3">
          <RideLensPicker
            lenses={lenses}
            activeId={lens?.id ?? WHOLE_LIFE}
            birthYear={birthYear}
            onLensChange={onRideLensChange}
            onBirthYearChange={onBirthYearChange}
          />
          <RideControls
            title={title}
            suggestedTitle={lens?.title ?? null}
            rider={rider}
            hasCart={hasCart}
            onTitleChange={onTitleChange}
            onRiderChange={onRiderChange}
          />
        </div>
      )}
      <FoldOut label={t("ride.shareSection")} choice={FOLD_OUTS.share} className="w-full">
        <ExportButton
          svg={svg}
          width={track.width}
          height={track.height}
          story={{ drawing: storyDrawingOf(track, scene), title: drawingTitle, events: lensEvents }}
          shareRide={shareable}
        />
        <RideVideoButton svg={svg} track={track} events={lensEvents} title={drawingTitle} isMonochrome={scene?.palette.kind === "line"} sceneryKind={scene?.palette.kind ?? null} />
        <ShareLinkPanel ride={shareable} />
        <RideTogetherInvite mine={shareable} />
      </FoldOut>
      {report && <LifeReportPanel report={report} isSample={isSample} />}
      <LifeStatsPanel events={happened} foldOut={FOLD_OUTS.stats} />
      <p className="text-sm text-muted">{t("ride.creativeNote")}</p>
    </section>
  );
}
