/**
 * Holds the story and events, and moves the user between writing, reviewing and the ride.
 * The stages are separate, so editing the story can never wipe a user's event edits.
 * All of this state lives in React only and disappears when the page closes.
 */
"use client";

import { useState, type ReactElement } from "react";
import { EventReview } from "@/components/EventReview/EventReview";
import { RideResult } from "@/components/RollerCoaster/RideResult";
import { StoryEditor } from "@/components/StoryEditor/StoryEditor";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { addBlankEvent } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";

type Stage = "story" | "review" | "ride";

export function RideFlow(): ReactElement {
  const [stage, setStage] = useState<Stage>("story");
  const [story, setStory] = useState("");
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [clarifications, setClarifications] = useState<readonly string[]>([]);

  function startReview(result: ExtractionResult): void {
    setEvents(result.events);
    setClarifications(result.clarifications);
    setStage("review");
  }

  if (stage === "ride") {
    return (
      <RideResult
        events={events}
        onEventsChange={setEvents}
        onBack={() => setStage("review")}
      />
    );
  }

  if (stage === "review") {
    return (
      <EventReview
        events={events}
        clarifications={clarifications}
        onEventsChange={setEvents}
        onBack={() => setStage("story")}
        onContinue={() => setStage("ride")}
      />
    );
  }

  return (
    <StoryEditor
      story={story}
      hasEvents={events.length > 0}
      onStoryChange={setStory}
      onExtracted={startReview}
      onReturnToEvents={() => setStage("review")}
      onAddManually={() => {
        setEvents(addBlankEvent([]));
        setClarifications([]);
        setStage("review");
      }}
    />
  );
}
