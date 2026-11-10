/**
 * Browser state for Ride it sounds: whether they are on, remembered on this device, and the player that makes them.
 * Sound starts off, and the audio context is created only when the user turns sound on, as browsers require.
 * Reading or saving the choice never throws, so private windows and blocked storage simply start with sound off.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { createRideSoundPlayer, type RideSoundPlayer } from "./rideSoundPlayer";

const SOUND_KEY = "lifecycle-roller-coaster:sound";
const SOUND_ON = "on";
const SOUND_OFF = "off";

export interface RideSounds {
  isOn: boolean;
  toggle: () => void;
  /** Call from a click that starts a ride, so audio is allowed to begin. */
  prepare: () => void;
  /** The player while sound is on, otherwise null. */
  player: RideSoundPlayer | null;
  /** Stops anything still sounding, such as when a ride ends because the drawing changed. */
  silence: () => void;
}

interface Audio {
  context: AudioContext;
  player: RideSoundPlayer;
}

function savedChoice(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === SOUND_ON;
  } catch {
    return false;
  }
}

function saveChoice(isOn: boolean): void {
  try {
    window.localStorage.setItem(SOUND_KEY, isOn ? SOUND_ON : SOUND_OFF);
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
}

/** Runs only in the browser (the ride pages render client-side), so the saved choice is the initial state. */
export function useRideSounds(): RideSounds {
  const [isOn, setIsOn] = useState(savedChoice);
  const audio = useRef<Audio | null>(null);

  useEffect(
    () => () => {
      void audio.current?.context.close();
      audio.current = null;
    },
    [],
  );

  /** Creates the audio once, from a click, and wakes it if the browser put it to sleep. */
  function wake(): void {
    if (audio.current === null) {
      const context = new AudioContext();
      audio.current = { context, player: createRideSoundPlayer(context, context.destination) };
    }
    void audio.current.context.resume();
  }

  function toggle(): void {
    const next = !isOn;
    setIsOn(next);
    saveChoice(next);
    if (next) {
      wake();
    } else {
      audio.current?.player.stop();
    }
  }

  function prepare(): void {
    if (isOn) {
      wake();
    }
  }

  const player: RideSoundPlayer | null = isOn
    ? { play: (cue) => audio.current?.player.play(cue), stop: () => audio.current?.player.stop() }
    : null;
  function silence(): void {
    audio.current?.player.stop();
  }

  return { isOn, toggle, prepare, player, silence };
}
