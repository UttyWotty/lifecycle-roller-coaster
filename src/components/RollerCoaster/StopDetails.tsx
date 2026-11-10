/**
 * Panel showing the selected stop, with live controls for its intensity.
 * Changes go straight to the event list, so the track redraws as the user adjusts them.
 * The full title and description appear here, because the track shows shortened labels.
 */
import type { ReactElement } from "react";
import { IntensityFields } from "@/components/EventReview/IntensityFields";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { EventPatch } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";
import { shownDate } from "@/lib/track/labelWidth";

interface StopDetailsProps {
  event: LifeEvent;
  onChange: (patch: EventPatch) => void;
}

export function StopDetails({ event, onChange }: StopDetailsProps): ReactElement {
  const t = useT();
  const locale = useLocale();
  return (
    <section
      aria-label={t("ride.selectedStop")}
      className="flex flex-col gap-3 rounded-lg border border-muted p-4 wrap-anywhere"
    >
      <div>
        <h2 className="font-semibold">{event.title}</h2>
        <p className="text-sm text-muted">{shownDate(event.date, locale)}</p>
      </div>
      {event.description && <p className="text-sm">{event.description}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <IntensityFields event={event} onChange={onChange} />
      </div>
    </section>
  );
}
