/**
 * State behind the ride flow, with the actions that move between stages.
 * It decides what each result replaces, so a sample never overwrites what the user wrote.
 * The user's own ride, but never their story text, is saved on their device and brought back on their next visit.
 */
"use client";

import { useEffect, useState } from "react";
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
import { WHOLE_LIFE, keptLens } from "@/lib/lenses/rideLenses";
import type { SavedRide } from "@/lib/saved/savedRide";
import { clearSavedRide, loadSavedRide, saveRide } from "./rideStorage";

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
  /** The chosen lens id; the ride falls back to the whole life when it no longer applies. */
  rideLens: string;
  birthYear: number | null;
  /** True when the ride on screen is the user's own and is kept on this device. */
  isSavedOnDevice: boolean;
  setStage: (stage: Stage) => void;
  setStory: (story: string) => void;
  setEvents: (events: LifeEvent[]) => void;
  setRideTitle: (title: string) => void;
  setRideStyle: (style: RideStyle) => void;
  setRideTheme: (theme: RideTheme) => void;
  setRider: (rider: Rider) => void;
  setFitToScreen: (fitToScreen: boolean) => void;
  setRideLens: (lens: string) => void;
  setBirthYear: (birthYear: number | null) => void;
  showResult: (result: ExtractionResult) => void;
  showSample: () => void;
  returnToEvents: () => void;
  addManually: () => void;
  /** Deletes the saved ride and returns to an empty story. */
  startOver: () => void;
}

/** Runs only in the browser (see BrowserRideFlow), because it reads the ride saved on the device. */
export function useRideState(startWithSample: boolean): RideState {
  const [opening] = useState<SampleLife | null>(() =>
    startWithSample ? pickSample(null, Math.random()) : null,
  );
  /** Read once in the browser; this hook only runs there, so the first render already shows a saved ride. */
  const [saved] = useState<SavedRide | null>(() => (startWithSample ? null : loadSavedRide()));
  const [stage, setStage] = useState<Stage>(opening || saved ? "ride" : "story");
  const [story, setStory] = useState(opening ? sampleStory(opening) : "");
  const [events, setEvents] = useState<readonly LifeEvent[]>(opening?.events ?? saved?.events ?? []);
  const [clarifications, setClarifications] = useState<readonly string[]>(saved?.clarifications ?? []);
  const [chapters, setChapters] = useState<readonly LifeChapter[]>(opening?.chapters ?? saved?.chapters ?? []);
  const [report, setReport] = useState<LifeReport | null>(opening?.report ?? saved?.report ?? null);
  const [isDemo, setIsDemo] = useState(saved?.isDemo ?? false);
  const [sample, setSample] = useState<SampleLife | null>(opening);
  const [rideTitle, setRideTitle] = useState(opening?.title ?? saved?.title ?? "");
  const [rideStyle, setRideStyle] = useState<RideStyle>(opening?.rideStyle ?? saved?.style ?? DEFAULT_RIDE_STYLE);
  const [rideTheme, setRideTheme] = useState<RideTheme>(opening?.rideTheme ?? saved?.theme ?? DEFAULT_RIDE_THEME);
  const [rider, setRider] = useState<Rider>(opening?.rider ?? saved?.rider ?? DEFAULT_RIDER);
  const [fitToScreen, setFitToScreen] = useState(saved?.fitToScreen ?? false);
  const [rideLens, setRideLens] = useState(saved ? keptLens(saved.events, saved.lens, saved.birthYear) : WHOLE_LIFE);
  const [birthYear, setBirthYear] = useState<number | null>(saved?.birthYear ?? null);

  /** Samples are built in and never saved; anything the user made themselves is. */
  const isOwnRide = sample === null;
  useEffect(() => {
    if (isOwnRide) {
      saveRide({
        events,
        chapters,
        report,
        clarifications,
        isDemo,
        title: rideTitle,
        style: rideStyle,
        theme: rideTheme,
        rider,
        fitToScreen,
        lens: rideLens,
        birthYear,
      });
    }
  }, [isOwnRide, events, chapters, report, clarifications, isDemo, rideTitle, rideStyle, rideTheme, rider, fitToScreen, rideLens, birthYear]);

  /** An edit that leaves the chosen lens without a ride falls back to the whole life for good. */
  function changeEvents(next: readonly LifeEvent[]): void {
    setEvents(next);
    setRideLens(keptLens(next, rideLens, birthYear));
  }

  function changeBirthYear(next: number | null): void {
    setBirthYear(next);
    setRideLens(keptLens(events, rideLens, next));
  }

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
    setRideLens(WHOLE_LIFE);
    setStage("ride");
  }

  function showResult(result: ExtractionResult): void {
    leaveSample();
    setEvents(result.events);
    setChapters(result.chapters);
    setReport(result.report);
    setClarifications(result.clarifications);
    setIsDemo(result.isDemo);
    setRideLens(WHOLE_LIFE);
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
    setRideLens(WHOLE_LIFE);
    setStage("review");
  }

  function startOver(): void {
    clearSavedRide();
    setSample(null);
    setStory("");
    setEvents([]);
    setChapters([]);
    setReport(null);
    setClarifications([]);
    setIsDemo(false);
    setRideTitle("");
    setRideStyle(DEFAULT_RIDE_STYLE);
    setRideTheme(DEFAULT_RIDE_THEME);
    setRider(DEFAULT_RIDER);
    setFitToScreen(false);
    setRideLens(WHOLE_LIFE);
    setBirthYear(null);
    setStage("story");
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
    rideLens,
    birthYear,
    isSavedOnDevice: isOwnRide && events.length > 0,
    setStage,
    setStory,
    setEvents: changeEvents,
    setRideTitle,
    setRideStyle,
    setRideTheme,
    setRider,
    setFitToScreen,
    setRideLens,
    setBirthYear: changeBirthYear,
    showResult,
    showSample,
    returnToEvents,
    addManually,
    startOver,
  };
}
