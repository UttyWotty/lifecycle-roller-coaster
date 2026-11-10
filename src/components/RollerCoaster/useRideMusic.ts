/**
 * Browser state for the theme music: whether it is on, remembered on this device, and playing it while Ride it plays.
 * The audio context is made only from a click, as browsers require, and music stops whenever the ride is not playing.
 * The same choice is read by the video recorder, so a video has music exactly when Ride it does.
 */
"use client";

import { useEffect, useRef } from "react";
import { tuneFor } from "@/lib/music/themeTunes";
import type { SceneryKind } from "@/lib/scene/themes";
import { createDeviceChoice } from "./deviceChoice";
import { createMusicPlayer, type MusicPlayer } from "./musicPlayer";
import type { PlaybackStatus } from "./useRidePlayback";

const music = createDeviceChoice("lifecycle-roller-coaster:music");

/** Whether Music is on, for the video recorder, which reads it when a recording starts. */
export const isMusicOn = music.isOn;

export interface RideMusic {
  isOn: boolean;
  toggle: () => void;
  /** Call from the click that starts a ride, so audio is allowed to begin. */
  prepare: () => void;
}

interface Audio {
  context: AudioContext;
  player: MusicPlayer;
}

/** Plays the scenery's tune while the ride is playing and Music is on. */
export function useRideMusic(status: PlaybackStatus | null, kind: SceneryKind | null): RideMusic {
  const choice = music.useChoice();
  const audio = useRef<Audio | null>(null);

  function wake(): void {
    if (audio.current === null) {
      const context = new AudioContext();
      audio.current = { context, player: createMusicPlayer(context, context.destination) };
    }
    void audio.current.context.resume();
  }

  const isPlaying = choice.isOn && status === "playing";
  useEffect(() => {
    if (!isPlaying || audio.current === null) {
      return;
    }
    const { player } = audio.current;
    player.play(tuneFor(kind));
    return () => player.stop();
  }, [isPlaying, kind]);

  useEffect(
    () => () => {
      audio.current?.player.stop();
      void audio.current?.context.close();
      audio.current = null;
    },
    [],
  );

  function toggle(): void {
    if (!choice.isOn) {
      wake();
    }
    choice.toggle();
  }

  function prepare(): void {
    if (choice.isOn) {
      wake();
    }
  }

  return { isOn: choice.isOn, toggle, prepare };
}
