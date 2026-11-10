/**
 * The card and controls shown during Ride it: the story of the stop the cart has reached, then the life report.
 * The stop's title is announced to screen readers as the ride moves on, and every control also has a key.
 * It only displays what the playback hook reports and passes button presses back to it.
 */
import type { ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { shownDate } from "@/lib/track/labelWidth";
import type { TrackStop } from "@/lib/track/types";
import type { PlaybackStatus } from "./useRidePlayback";

interface RideItPanelProps {
  status: PlaybackStatus;
  event: LifeEvent | null;
  stopNumber: number;
  stopCount: number;
  report: LifeReport | null;
  /** Stops still to come, shown when the ride reaches today. */
  comingUp: readonly TrackStop[];
  onTogglePause: () => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

function Story({ event, stopNumber, stopCount }: Pick<RideItPanelProps, "event" | "stopNumber" | "stopCount">): ReactElement {
  const t = useT();
  const locale = useLocale();
  if (event === null) {
    return <p className="text-lg font-semibold">{t("ride.starting")}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">
        {t("ride.stopOf", { number: stopNumber, count: stopCount, date: shownDate(event.date, locale) })}
      </p>
      <h2 className="wrap-anywhere text-xl font-semibold">{event.title}</h2>
      {event.description && <p className="wrap-anywhere">{event.description}</p>}
    </>
  );
}

function ComingUp({ stops }: { stops: readonly TrackStop[] }): ReactElement | null {
  const t = useT();
  const locale = useLocale();
  if (stops.length === 0) {
    return null;
  }
  return (
    <>
      <p className="mt-2 font-semibold">{t("ride.comingUp")}</p>
      <ul className="list-disc pl-5">
        {stops.map((stop) => (
          <li key={stop.id} className="wrap-anywhere">
            {t("ride.comingUpStop", { title: stop.title, date: shownDate(stop.date, locale) })}
          </li>
        ))}
      </ul>
    </>
  );
}

function Ending({ report }: Pick<RideItPanelProps, "report">): ReactElement {
  const t = useT();
  if (report === null) {
    return <p className="text-lg font-semibold">{t("ride.plainEnding")}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">{t("ride.endOfRide")}</p>
      <h2 className="wrap-anywhere text-xl font-semibold">{report.headline}</h2>
      <ul className="list-disc pl-5">
        {report.highlights.map((highlight) => (
          <li key={highlight} className="wrap-anywhere">
            {highlight}
          </li>
        ))}
      </ul>
    </>
  );
}

export function RideItPanel(props: RideItPanelProps): ReactElement {
  const { status, event, stopNumber, stopCount, report, comingUp, onTogglePause, onNext, onBack, onExit } = props;
  const t = useT();
  const isFinished = status === "finished";
  const playLabel = isFinished ? t("ride.rideAgain") : status === "playing" ? t("ride.pause") : t("ride.play");
  return (
    <section aria-label={t("ride.rideIt")} className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      <div aria-live="polite" className="flex min-h-24 flex-col gap-1">
        {isFinished ? <Ending report={report} /> : <Story event={event} stopNumber={stopNumber} stopCount={stopCount} />}
        {isFinished && <ComingUp stops={comingUp} />}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} disabled={isFinished || stopNumber <= 1} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.back")}
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
        >
          {playLabel}
        </button>
        <button type="button" onClick={onNext} disabled={isFinished} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.next")}
        </button>
        <button type="button" onClick={onExit} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.exitRide")}
        </button>
      </div>
      <p className="text-sm text-muted">{t("ride.keyHint")}</p>
    </section>
  );
}
