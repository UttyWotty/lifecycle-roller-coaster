/**
 * Moves the user from their story, or a sample life, straight to the ride.
 * Editing events by hand is an optional stage, and stages stay separate so no edits are lost.
 * The state and its rules live in useRideState, and this component only chooses what to show.
 */
"use client";

import type { ReactElement } from "react";
import { EventReview } from "@/components/EventReview/EventReview";
import { RideResult } from "@/components/RollerCoaster/RideResult";
import { StoryEditor } from "@/components/StoryEditor/StoryEditor";
import { useRideState } from "./useRideState";

interface RideFlowProps {
  /** Opens on a random sample life instead of the empty story box. */
  startWithSample: boolean;
  /** The id this ride is saved under on the device. */
  rideId: string;
}

export function RideFlow({ startWithSample, rideId }: RideFlowProps): ReactElement {
  const ride = useRideState(startWithSample, rideId);

  if (ride.stage === "ride") {
    return (
      <RideResult
        key={ride.sampleId}
        events={ride.events}
        clarifications={ride.clarifications}
        isDemo={ride.isDemo}
        isSample={ride.sampleId !== null}
        isSavedOnDevice={ride.isSavedOnDevice}
        title={ride.rideTitle}
        rideStyle={ride.rideStyle}
        rideTheme={ride.rideTheme}
        chapters={ride.chapters}
        report={ride.report}
        rider={ride.rider}
        fitToScreen={ride.fitToScreen}
        rideLens={ride.rideLens}
        birthYear={ride.birthYear}
        onRideLensChange={ride.setRideLens}
        onBirthYearChange={ride.setBirthYear}
        onTitleChange={ride.setRideTitle}
        onRideStyleChange={ride.setRideStyle}
        onRideThemeChange={ride.setRideTheme}
        onRiderChange={ride.setRider}
        onFitToScreenChange={ride.setFitToScreen}
        onEventsChange={ride.setEvents}
        onEditEvents={() => ride.setStage("review")}
        onAddFutureStop={ride.addFutureStop}
        onBackToStory={() => ride.setStage("story")}
        onShowAnotherSample={ride.showSample}
        onStartOver={ride.startOver}
      />
    );
  }

  if (ride.stage === "review") {
    return (
      <EventReview
        events={ride.events}
        clarifications={ride.clarifications}
        isDemo={ride.isDemo}
        isSample={ride.sampleId !== null}
        onEventsChange={ride.setEvents}
        onBack={() => ride.setStage("story")}
        onContinue={() => ride.setStage("ride")}
      />
    );
  }

  return (
    <StoryEditor
      story={ride.story}
      hasEvents={ride.events.length > 0}
      isSample={ride.sampleId !== null}
      onStoryChange={ride.setStory}
      onExtracted={ride.showResult}
      onReturnToEvents={ride.returnToEvents}
      onAddManually={ride.addManually}
      onShowSample={ride.showSample}
    />
  );
}
