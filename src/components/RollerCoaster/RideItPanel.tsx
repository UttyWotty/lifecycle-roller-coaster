/**
 * The card and controls shown during Ride it: the story of the stop the cart has reached, then the life report.
 * The stop's title is announced to screen readers as the ride moves on, and every control also has a key.
 * It only displays what the playback hook reports and passes button presses back to it.
 */
import type { ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import type { LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { UNKNOWN_DATE } from "@/lib/track/labelWidth";
import type { PlaybackStatus } from "./useRidePlayback";

interface RideItPanelProps {
  status: PlaybackStatus;
  event: LifeEvent | null;
  stopNumber: number;
  stopCount: number;
  report: LifeReport | null;
  onTogglePause: () => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

const STARTING_TEXT = "Hold on tight, the ride is starting.";
const PLAIN_ENDING = "That was your ride. Every stop is still on the track to explore.";
const KEY_HINT = "Keys: Space pauses, arrows move between stops, Escape exits.";

function Story({ event, stopNumber, stopCount }: Pick<RideItPanelProps, "event" | "stopNumber" | "stopCount">): ReactElement {
  if (event === null) {
    return <p className="text-lg font-semibold">{STARTING_TEXT}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">
        Stop {stopNumber} of {stopCount} · {event.date ?? UNKNOWN_DATE}
      </p>
      <h2 className="wrap-anywhere text-xl font-semibold">{event.title}</h2>
      {event.description && <p className="wrap-anywhere">{event.description}</p>}
    </>
  );
}

function Ending({ report }: Pick<RideItPanelProps, "report">): ReactElement {
  if (report === null) {
    return <p className="text-lg font-semibold">{PLAIN_ENDING}</p>;
  }
  return (
    <>
      <p className="text-sm text-muted">End of the ride</p>
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
  const { status, event, stopNumber, stopCount, report, onTogglePause, onNext, onBack, onExit } = props;
  const isFinished = status === "finished";
  return (
    <section aria-label="Ride it" className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      <div aria-live="polite" className="flex min-h-24 flex-col gap-1">
        {isFinished ? <Ending report={report} /> : <Story event={event} stopNumber={stopNumber} stopCount={stopCount} />}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} disabled={isFinished || stopNumber <= 1} className={SECONDARY_BUTTON_CLASS}>
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
