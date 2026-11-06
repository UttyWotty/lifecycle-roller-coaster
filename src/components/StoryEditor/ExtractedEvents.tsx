/**
 * Read-only list of the events found in a story, with any clarification questions.
 * Uncertain readings are labelled, so an AI guess is never presented as a fact.
 * Editing these events arrives with the review screen in roadmap phase 3.
 */
import type { ReactElement } from "react";
import { LOW_CONFIDENCE_THRESHOLD, type ExtractionResult } from "@/lib/ai/extraction";
import type { LifeEvent } from "@/lib/events/schema";

interface ExtractedEventsProps {
  result: ExtractionResult;
}

const UNKNOWN_DATE_LABEL = "Date unknown";

function EventCard({ event }: { event: LifeEvent }): ReactElement {
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-muted p-4">
      <h3 className="font-semibold">{event.title}</h3>
      <p className="text-sm text-muted">
        {event.date ?? UNKNOWN_DATE_LABEL} · <span className="capitalize">{event.category}</span> ·{" "}
        <span className="capitalize">{event.sentiment}</span> · Impact {event.impact}
        {event.confidence < LOW_CONFIDENCE_THRESHOLD && " · Best guess"}
      </p>
      <p className="text-sm">{event.description}</p>
    </li>
  );
}

export function ExtractedEvents({ result }: ExtractedEventsProps): ReactElement {
  const { events, clarifications } = result;
  if (events.length === 0) {
    return <p>We could not find any events. Try adding what happened and roughly when.</p>;
  }
  return (
    <section className="flex flex-col gap-4 wrap-anywhere" aria-label="Events found in your story">
      <h2 className="text-2xl font-bold">Here is what we found</h2>
      <ul className="flex flex-col gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ul>
      {clarifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">A few questions</h3>
          <ul className="list-disc pl-5 text-sm">
            {clarifications.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
