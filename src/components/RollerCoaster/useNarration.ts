/**
 * Browser side of the narrated ride: the remembered on/off choice, and speaking each stop with the device's own voice.
 * Speech uses the browser's built-in voices, so nothing is downloaded or uploaded, and the choice starts off.
 * A new line cuts off the last one instead of queueing, and pausing, exiting or leaving the page stops the voice at once.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { NARRATION_END, narrationFor } from "@/lib/ride/narration";
import type { PlaybackStatus } from "./useRidePlayback";

const NARRATE_KEY = "lifecycle-roller-coaster:narrate";
const NARRATE_ON = "on";
const NARRATE_OFF = "off";
/** Narration is off unless the user turns it on. */
const DEFAULT_NARRATE = false;
const END_KEY = "end";

export interface Narration {
  /** False where the browser has no speech voice, so the button is left out. */
  isSupported: boolean;
  isOn: boolean;
  toggle: () => void;
}

interface RideMoment {
  narration: Narration;
  /** Null when no ride is running. */
  status: PlaybackStatus | null;
  stopIndex: number | null;
  stop: { title: string; date: string | null } | null;
  stopCount: number;
}

function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function savedChoice(): boolean {
  try {
    return window.localStorage.getItem(NARRATE_KEY) === NARRATE_ON;
  } catch {
    return DEFAULT_NARRATE;
  }
}

function saveChoice(isOn: boolean): void {
  try {
    window.localStorage.setItem(NARRATE_KEY, isOn ? NARRATE_ON : NARRATE_OFF);
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
}

function silence(): void {
  if (hasSpeech()) {
    window.speechSynthesis.cancel();
  }
}

function say(text: string): void {
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

/** Runs only in the browser (the ride pages render client-side), so the saved choice is the initial state. */
export function useNarration(): Narration {
  const [isSupported] = useState(hasSpeech);
  const [isOn, setIsOn] = useState(() => isSupported && savedChoice());

  function toggle(): void {
    const next = !isOn;
    setIsOn(next);
    saveChoice(next);
    if (!next) {
      silence();
    }
  }

  return { isSupported, isOn, toggle };
}

/** Speaks each stop once as the ride reaches it, and the end, while narration is on. */
export function useNarrateRide({ narration, status, stopIndex, stop, stopCount }: RideMoment): void {
  const spoken = useRef<string | null>(null);
  const isOn = narration.isOn && narration.isSupported;
  const line = status === "finished" ? NARRATION_END : stop === null || stopIndex === null ? null : narrationFor(stop, stopIndex, stopCount);
  const key = status === "finished" ? END_KEY : stopIndex === null ? null : String(stopIndex);

  useEffect(() => {
    if (!isOn) {
      return;
    }
    if (status !== "playing" && status !== "finished") {
      spoken.current = status === null ? null : spoken.current;
      silence();
      return;
    }
    if (key !== null && line !== null && key !== spoken.current) {
      spoken.current = key;
      say(line);
    }
  }, [isOn, status, key, line]);

  useEffect(() => () => silence(), []);
}
