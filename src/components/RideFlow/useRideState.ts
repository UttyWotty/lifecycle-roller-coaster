/**
 * State behind the ride flow, with the actions that move between stages.
 * It decides what each result replaces, so a sample never overwrites what the user wrote.
 * All of this state lives in React only and disappears when the page closes.
 */
"use client";

import { useState } from "react";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { addBlankEvent, findInvalidFields } from "@/lib/events/editing";
import type { LifeChapter, LifeReport } from "@/lib/events/insights";
import type { LifeEvent } from "@/lib/events/schema";
import { pickSample } from "@/lib/samples/pickSample";
import { sampleStory, type SampleLife } from "@/lib/samples/sampleLives";
import { DEFAULT_RIDER, type Rider } from "@/lib/scene/riders";
import { DEFAULT_RIDE_THEME, type RideTheme } from "@/lib/scene/themes";
import { DEFAULT_RIDE_STYLE } from "@/lib/track/rideStyles";
import type { RideStyle } from "@/lib/track/types";

export type Stage = "story" | "review" | "ride";

export interface RideState {
  stage: Stage;
  story: string;
  events: readonly LifeEvent[];
  clarifications: readonly string[];
  chapters: readonly LifeChapter[];
  report: LifeReport | null;
  isDemo: boolean;
  sampleId: string | null;
  rideTitle: string;
  rideStyle: RideStyle;
  rideTheme: RideTheme;
  rider: Rider;
  fitToScreen: boolean;
  setStage: (stage: Stage) => void;
  setStory: (story: string) => void;
  setEvents: (events: LifeEvent[]) => void;
  setRideTitle: (title: string) => void;
  setRideStyle: (style: RideStyle) => void;
  setRideTheme: (theme: RideTheme) => void;
  setRider: (rider: Rider) => void;
  setFitToScreen: (fitToScreen: boolean) => void;
  showResult: (result: ExtractionResult) => void;
  showSample: () => void;
  returnToEvents: () => void;
  addManually: () => void;
}

export function useRideState(startWithSample: boolean): RideState {
  const [opening] = useState<SampleLife | null>(() =>
    startWithSample ? pickSample(null, Math.random()) : null,
  );
  const [stage, setStage] = useState<Stage>(opening ? "ride" : "story");
  const [story, setStory] = useState(opening ? sampleStory(opening) : "");
  const [events, setEvents] = useState<readonly LifeEvent[]>(opening?.events ?? []);
  const [clarifications, setClarifications] = useState<readonly string[]>([]);
  const [chapters, setChapters] = useState<readonly LifeChapter[]>(opening?.chapters ?? []);
  const [report, setReport] = useState<LifeReport | null>(opening?.report ?? null);
  const [isDemo, setIsDemo] = useState(false);
  const [sample, setSample] = useState<SampleLife | null>(opening);
  const [rideTitle, setRideTitle] = useState(opening?.title ?? "");
  const [rideStyle, setRideStyle] = useState<RideStyle>(opening?.rideStyle ?? DEFAULT_RIDE_STYLE);
  const [rideTheme, setRideTheme] = useState<RideTheme>(opening?.rideTheme ?? DEFAULT_RIDE_THEME);
  const [rider, setRider] = useState<Rider>(opening?.rider ?? DEFAULT_RIDER);
  const [fitToScreen, setFitToScreen] = useState(false);

  /** Drops what belongs to a sample, so its title never ends up on the user's own ride. */
  function leaveSample(): void {
    if (sample !== null) {
      setSample(null);
      setRideTitle("");
    }
  }

  function showSample(): void {
    const next = pickSample(sample?.id ?? null, Math.random());
    const isStoryUntouched = story.trim() === "" || (sample !== null && story === sampleStory(sample));
    if (isStoryUntouched) {
      setStory(sampleStory(next));
    }
    setSample(next);
    setEvents(next.events);
    setChapters(next.chapters);
    setReport(next.report);
    setClarifications([]);
    setIsDemo(false);
    setRideTitle(next.title);
    setRideStyle(next.rideStyle);
    setRideTheme(next.rideTheme);
    setRider(next.rider);
    setStage("ride");
  }

  function showResult(result: ExtractionResult): void {
    leaveSample();
    setEvents(result.events);
    setChapters(result.chapters);
    setReport(result.report);
    setClarifications(result.clarifications);
    setIsDemo(result.isDemo);
    setStage(result.events.length > 0 ? "ride" : "review");
  }

  function returnToEvents(): void {
    const hasInvalidEvents = Object.keys(findInvalidFields(events)).length > 0;
    setStage(hasInvalidEvents ? "review" : "ride");
  }

  function addManually(): void {
    leaveSample();
    setEvents(addBlankEvent([]));
    setChapters([]);
    setReport(null);
    setClarifications([]);
    setIsDemo(false);
    setStage("review");
  }

  return {
    stage,
    story,
    events,
    clarifications,
    chapters,
    report,
    isDemo,
    sampleId: sample?.id ?? null,
    rideTitle,
    rideStyle,
    rideTheme,
    rider,
    fitToScreen,
    setStage,
    setStory,
    setEvents,
    setRideTitle,
    setRideStyle,
    setRideTheme,
    setRider,
    setFitToScreen,
    showResult,
    showSample,
    returnToEvents,
    addManually,
  };
}
