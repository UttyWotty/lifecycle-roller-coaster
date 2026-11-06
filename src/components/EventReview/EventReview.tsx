/**
 * Optional stage where a user corrects their events by hand.
 * It wires list actions to the pure editing logic, and a deletion can be undone.
 * Keyboard focus moves to the heading on arrival, so screen reader users know the page changed.
 */
"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  addBlankEvent,
  confirmEvent,
  deleteEvent,
  findInvalidFields,
  moveEvent,
  restoreEvent,
  sortEventsByDate,
  updateEvent,
} from "@/lib/events/editing";
import { ReadingNotes } from "@/components/RideFlow/ReadingNotes";
import type { LifeEvent } from "@/lib/events/schema";
import { EventCard } from "./EventCard";
import { SECONDARY_BUTTON_CLASS } from "./fieldStyles";

interface EventReviewProps {
  events: readonly LifeEvent[];
  clarifications: readonly string[];
  isDemo: boolean;
  isSample: boolean;
  onEventsChange: (events: LifeEvent[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface RemovedEvent {
  event: LifeEvent;
  index: number;
}

const NO_EVENTS_MESSAGE = "No events yet. Add what happened and roughly when.";
const UNTITLED = "Untitled event";

export function EventReview(props: EventReviewProps): ReactElement {
  const { events, clarifications, isDemo, isSample, onEventsChange, onBack, onContinue } = props;
  const [removed, setRemoved] = useState<RemovedEvent | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const invalidFields = findInvalidFields(events);
  const invalidCount = Object.keys(invalidFields).length;

  useEffect(() => heading.current?.focus(), []);

  function handleDelete(event: LifeEvent, index: number): void {
    setRemoved({ event, index });
    onEventsChange(deleteEvent(events, event.id));
  }

  function handleUndo({ event, index }: RemovedEvent): void {
    setRemoved(null);
    onEventsChange(restoreEvent(events, event, index));
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 wrap-anywhere">
      <header className="flex flex-col gap-3">
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
          Review your events
        </h1>
        <p>This step is optional. Change anything that does not feel right.</p>
        <button type="button" onClick={onBack} className={`${SECONDARY_BUTTON_CLASS} self-start`}>
          Back to my story
        </button>
      </header>
      <ReadingNotes isDemo={isDemo} isSample={isSample} clarifications={clarifications} />
      {events.length === 0 && <p>{NO_EVENTS_MESSAGE}</p>}
      <ol className="flex flex-col gap-4">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            position={index + 1}
            total={events.length}
            invalidFields={invalidFields[event.id] ?? []}
            onChange={(patch) => onEventsChange(updateEvent(events, event.id, patch))}
            onConfirm={() => onEventsChange(confirmEvent(events, event.id))}
            onMove={(direction) => onEventsChange(moveEvent(events, event.id, direction))}
            onDelete={() => handleDelete(event, index)}
          />
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEventsChange(addBlankEvent(events))}
          className={SECONDARY_BUTTON_CLASS}
        >
          Add an event
        </button>
        <button
          type="button"
          onClick={() => onEventsChange(sortEventsByDate(events))}
          className={SECONDARY_BUTTON_CLASS}
        >
          Sort by date
        </button>
      </div>
      <button
        type="button"
        disabled={events.length === 0 || invalidCount > 0}
        onClick={onContinue}
        className="min-h-11 self-start rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
      >
        See my ride
      </button>
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm">
        {removed && <span>Removed {removed.event.title || UNTITLED}.</span>}
        {removed && (
          <button
            type="button"
            onClick={() => handleUndo(removed)}
            className={SECONDARY_BUTTON_CLASS}
          >
            Undo
          </button>
        )}
        {invalidCount > 0 && <span>Fix the highlighted fields in {invalidCount} of your events.</span>}
      </div>
    </section>
  );
}
