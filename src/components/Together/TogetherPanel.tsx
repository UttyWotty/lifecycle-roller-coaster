/**
 * The card and controls shown while two to four rides are ridden together, one column of the timeline at a time.
 * It names whose moment is whose, announces each column to screen readers, and ends with how many years they share.
 * It only displays what the playback hook reports and passes button presses back to it.
 */
import type { ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
import type { LifeEvent } from "@/lib/events/schema";
import type { PlaybackStatus } from "@/components/RollerCoaster/useRidePlayback";

export interface PersonMoment {
  name: string;
  event: LifeEvent | null;
}

interface TogetherPanelProps {
  status: PlaybackStatus;
  date: string | null;
  moments: readonly PersonMoment[] | null;
  sharedYears: number;
  /** How many rides are riding together, which sets the wording of the ending. */
  rideCount: number;
  onTogglePause: () => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

const PAIR = 2;
const ONE_YEAR = 1;

/** The ending's words for how many years the rides shared and how many people rode. */
function endingKey(sharedYears: number, isPair: boolean): MessageKey {
  if (sharedYears === 0) {
    return "together.endingNone";
  }
  if (isPair) {
    return sharedYears === ONE_YEAR ? "together.endingPairOne" : "together.endingPairMany";
  }
  return sharedYears === ONE_YEAR ? "together.endingGroupOne" : "together.endingGroupMany";
}

function Moments({ date, moments }: Pick<TogetherPanelProps, "date" | "moments">): ReactElement {
  const t = useT();
  if (moments === null) {
    return <p className="text-lg font-semibold">{t("together.starting")}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">{date ?? t("ride.dateUnknown")}</p>
      <ul className="flex flex-col gap-1">
        {moments.map(({ name, event }) => (
          <li key={name} className="wrap-anywhere">
            <span className="font-semibold">{name}:</span> {event?.title ?? t("together.nothingHere")}
          </li>
        ))}
      </ul>
    </>
  );
}

export function TogetherPanel(props: TogetherPanelProps): ReactElement {
  const { status, date, moments, sharedYears, rideCount, onTogglePause, onNext, onBack, onExit } = props;
  const t = useT();
  const isFinished = status === "finished";
  const ending = t(endingKey(sharedYears, rideCount === PAIR), { years: sharedYears });
  return (
    <section aria-label={t("together.panel")} className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      <div aria-live="polite" className="flex min-h-24 flex-col gap-1">
        {isFinished ? <p className="text-lg font-semibold">{ending}</p> : <Moments date={date} moments={moments} />}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} disabled={isFinished} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.back")}
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
        >
          {t(isFinished ? "ride.rideAgain" : status === "playing" ? "ride.pause" : "ride.play")}
        </button>
        <button type="button" onClick={onNext} disabled={isFinished} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.next")}
        </button>
        <button type="button" onClick={onExit} className={SECONDARY_BUTTON_CLASS}>
          {t("ride.exitRide")}
        </button>
      </div>
      <p className="text-sm text-muted">{t("together.keyHint")}</p>
    </section>
  );
}
