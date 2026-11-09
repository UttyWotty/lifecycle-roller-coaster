/**
 * The card and controls shown while two rides are ridden together, one column of the timeline at a time.
 * It names whose moment is whose, announces each column to screen readers, and ends with how many years they share.
 * It only displays what the playback hook reports and passes button presses back to it.
 */
import type { ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import type { LifeEvent } from "@/lib/events/schema";
import type { PlaybackStatus } from "@/components/RollerCoaster/useRidePlayback";
import { UNKNOWN_DATE } from "@/lib/track/labelWidth";

export interface PersonMoment {
  name: string;
  event: LifeEvent | null;
}

interface TogetherPanelProps {
  status: PlaybackStatus;
  date: string | null;
  moments: readonly PersonMoment[] | null;
  sharedYears: number;
  onTogglePause: () => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

const STARTING_TEXT = "Hold on together, the ride is starting.";
const KEY_HINT = "Keys: Space pauses, arrows move through time, Escape exits.";
const NOTHING_HERE = "Nothing marked here";

function Moments({ date, moments }: Pick<TogetherPanelProps, "date" | "moments">): ReactElement {
  if (moments === null) {
    return <p className="text-lg font-semibold">{STARTING_TEXT}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">{date ?? UNKNOWN_DATE}</p>
      <ul className="flex flex-col gap-1">
        {moments.map(({ name, event }) => (
          <li key={name} className="wrap-anywhere">
            <span className="font-semibold">{name}:</span> {event?.title ?? NOTHING_HERE}
          </li>
        ))}
      </ul>
    </>
  );
}

export function TogetherPanel(props: TogetherPanelProps): ReactElement {
  const { status, date, moments, sharedYears, onTogglePause, onNext, onBack, onExit } = props;
  const isFinished = status === "finished";
  const ending =
    sharedYears === 0
      ? "That was your ride together. Your big moments never landed in the same year."
      : `That was your ride together. You shared ${sharedYears} ${sharedYears === 1 ? "year" : "years"} with big moments for you both.`;
  return (
    <section aria-label="Ride together" className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      <div aria-live="polite" className="flex min-h-24 flex-col gap-1">
        {isFinished ? <p className="text-lg font-semibold">{ending}</p> : <Moments date={date} moments={moments} />}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} disabled={isFinished} className={SECONDARY_BUTTON_CLASS}>
          Back
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
        >
          {isFinished ? "Ride again" : status === "playing" ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={onNext} disabled={isFinished} className={SECONDARY_BUTTON_CLASS}>
          Next
        </button>
        <button type="button" onClick={onExit} className={SECONDARY_BUTTON_CLASS}>
          Exit ride
        </button>
      </div>
      <p className="text-sm text-muted">{KEY_HINT}</p>
    </section>
  );
}
