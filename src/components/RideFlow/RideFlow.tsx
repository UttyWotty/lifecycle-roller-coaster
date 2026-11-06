/**
 * Holds the story and events, and moves the user from their story straight to the ride.
 * Editing events by hand is an optional stage, and stages stay separate so no edits are lost.
 * All of this state lives in React only and disappears when the page closes.
 */
"use client";

import { useState, type ReactElement } from "react";
import { EventReview } from "@/components/EventReview/EventReview";
import { RideResult } from "@/components/RollerCoaster/RideResult";
import { StoryEditor } from "@/components/StoryEditor/StoryEditor";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { addBlankEvent, findInvalidFields } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";

type Stage = "story" | "review" | "ride";

export function RideFlow(): ReactElement {
  const [stage, setStage] = useState<Stage>("story");
  const [story, setStory] = useState("");
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [clarifications, setClarifications] = useState<readonly string[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  function showResult(result: ExtractionResult): void {
    setEvents(result.events);
    setClarifications(result.clarifications);
    setIsDemo(result.isDemo);
    setStage(result.events.length > 0 ? "ride" : "review");
  }

  function returnToEvents(): void {
    const hasInvalidEvents = Object.keys(findInvalidFields(events)).length > 0;
    setStage(hasInvalidEvents ? "review" : "ride");
  }

  if (stage === "ride") {
    return (
      <RideResult
        events={events}
        clarifications={clarifications}
        isDemo={isDemo}
        onEventsChange={setEvents}
        onEditEvents={() => setStage("review")}
        onBackToStory={() => setStage("story")}
      />
    );
  }

  if (stage === "review") {
    return (
      <EventReview
        events={events}
        clarifications={clarifications}
        isDemo={isDemo}
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
      onExtracted={showResult}
      onReturnToEvents={returnToEvents}
      onAddManually={() => {
        setEvents(addBlankEvent([]));
        setClarifications([]);
        setIsDemo(false);
        setStage("review");
      }}
    />
  );
}
