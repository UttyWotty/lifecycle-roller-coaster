/**
 * Ride stage where the user sees and adjusts their finished roller coaster.
 * The track is rebuilt from the events on every change, so adjustments show immediately.
 * It carries the reminder that the ride is a creative picture, not a measurement of a life.
 */
"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { updateEvent } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";
import { buildTrack } from "@/lib/track/buildTrack";
import { CategoryLegend } from "./CategoryLegend";
import { RideTrack } from "./RideTrack";
import { StopDetails } from "./StopDetails";

interface RideResultProps {
  events: readonly LifeEvent[];
  onEventsChange: (events: LifeEvent[]) => void;
  onBack: () => void;
}

const SELECT_PROMPT = "Select a stop on the track to adjust how it felt and how much it mattered.";
const CREATIVE_NOTE = "This ride is a creative picture of your story, not a measurement of your life.";

export function RideResult({ events, onEventsChange, onBack }: RideResultProps): ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const track = useMemo(() => buildTrack(events), [events]);
  const selected = events.find((event) => event.id === selectedId);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
          Your ride
        </h1>
        <button type="button" onClick={onBack} className={`${SECONDARY_BUTTON_CLASS} self-start`}>
          Back to my events
        </button>
      </header>
      <div
        tabIndex={0}
        role="region"
        aria-label="Roller coaster, scrolls sideways on small screens"
        className="overflow-x-auto"
      >
        <RideTrack track={track} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <CategoryLegend events={events} />
      {selected ? (
        <StopDetails
          event={selected}
          onChange={(patch) => onEventsChange(updateEvent(events, selected.id, patch))}
        />
      ) : (
        <p className="text-sm">{SELECT_PROMPT}</p>
      )}
      <p className="text-sm text-muted">{CREATIVE_NOTE}</p>
    </section>
  );
}
