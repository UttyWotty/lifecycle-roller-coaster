/**
 * State for Guess my ride: which stop is being guessed, the choices so far, and the results.
 * Each stop is guessed, then revealed, then the game moves on; after the last stop it shows the score.
 * The rules and scoring come from the pure guessGame module.
 */
"use client";

import { useState } from "react";
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
import { curtainFor, judgeGuess, type Curtain, type GuessResult, type StopSize } from "@/lib/guess/guessGame";
import type { TrackStop } from "@/lib/track/types";

export interface GuessGame {
  isPlaying: boolean;
  index: number;
  feeling: EventSentiment | null;
  size: StopSize | null;
  /** The result for the current stop once it is revealed, otherwise null. */
  revealed: GuessResult | null;
  results: readonly GuessResult[];
  isFinished: boolean;
  /** The curtain over the unrevealed part of a drawing of the ride, or null when nothing is hidden. */
  curtainOn: (stops: readonly TrackStop[]) => Curtain | null;
  start: () => void;
  stop: () => void;
  chooseFeeling: (feeling: EventSentiment) => void;
  chooseSize: (size: StopSize) => void;
  reveal: () => void;
  next: () => void;
}

const FIRST_STOP = 0;

/** Plays the stops with these ids, in order; ids keep the game steady when the drawing's style changes. */
export function useGuessGame(ids: readonly string[], events: readonly LifeEvent[]): GuessGame {
  const [isPlaying, setIsPlaying] = useState(false);
  const [index, setIndex] = useState(FIRST_STOP);
  const [feeling, setFeeling] = useState<EventSentiment | null>(null);
  const [size, setSize] = useState<StopSize | null>(null);
  const [results, setResults] = useState<readonly GuessResult[]>([]);
  const revealed = results.length > index ? results[index] : null;
  const isFinished = isPlaying && revealed !== null && index === ids.length - 1;

  function start(): void {
    setIsPlaying(true);
    setIndex(FIRST_STOP);
    setFeeling(null);
    setSize(null);
    setResults([]);
  }

  function reveal(): void {
    const event = events.find(({ id }) => id === ids[index]);
    if (feeling === null || size === null || event === undefined || revealed !== null) {
      return;
    }
    setResults([...results, judgeGuess({ feeling, size }, event)]);
  }

  function next(): void {
    if (revealed !== null && index < ids.length - 1) {
      setIndex(index + 1);
      setFeeling(null);
      setSize(null);
    }
  }

  return {
    isPlaying,
    index,
    feeling,
    size,
    revealed,
    results,
    isFinished,
    curtainOn: (stops) => (isPlaying ? curtainFor(stops, index, revealed !== null) : null),
    start,
    stop: () => setIsPlaying(false),
    chooseFeeling: setFeeling,
    chooseSize: setSize,
    reveal,
    next,
  };
}
