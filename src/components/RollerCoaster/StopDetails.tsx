/**
 * Panel showing the selected stop, with live controls for its intensity.
 * Changes go straight to the event list, so the track redraws as the user adjusts them.
 * The full title and description appear here, because the track shows shortened labels.
 */
import type { ReactElement } from "react";
import { IntensityFields } from "@/components/EventReview/IntensityFields";
import type { EventPatch } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";

interface StopDetailsProps {
  event: LifeEvent;
  onChange: (patch: EventPatch) => void;
}

const UNKNOWN_DATE = "Date unknown";

export function StopDetails({ event, onChange }: StopDetailsProps): ReactElement {
  return (
    <section
      aria-label="Selected stop"
      className="flex flex-col gap-3 rounded-lg border border-muted p-4 wrap-anywhere"
    >
      <div>
        <h2 className="font-semibold">{event.title}</h2>
        <p className="text-sm text-muted">{event.date ?? UNKNOWN_DATE}</p>
      </div>
      {event.description && <p className="text-sm">{event.description}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <IntensityFields event={event} onChange={onChange} />
      </div>
    </section>
  );
}
