/**
 * Browser side of Ride it: measures the rail, runs the clock, moves the cart and keeps it in view.
 * The cart and the scroll position change every frame directly in the DOM, so the scene is not redrawn each frame;
 * React state changes only when the ride reaches a new stop, pauses, finishes or ends.
 * Timing and geometry come from the pure ridePlayback module.
 */
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  buildTimeline,
  poseAt,
  positionAt,
  stopStartTime,
  type RailSample,
  type Timeline,
} from "@/lib/ride/ridePlayback";
import { FINISH_CUE, cueForStep, stepIndexAt } from "@/lib/ride/rideSounds";
import type { Track } from "@/lib/track/types";
import type { RideSoundPlayer } from "./rideSoundPlayer";
import { railSamples } from "./measureRail";

export type PlaybackStatus = "playing" | "paused" | "finished";

interface ActiveRide {
  track: Track;
  samples: RailSample[];
  timeline: Timeline;
}

export interface RidePlayback {
  /** Null when no ride is running, including after the drawing changed mid-ride. */
  status: PlaybackStatus | null;
  stopIndex: number | null;
  cartRef: RefObject<SVGGElement | null>;
  start: () => void;
  togglePause: () => void;
  next: () => void;
  back: () => void;
  exit: () => void;
}

interface PlaybackOptions {
  track: Track;
  /** The rail the cart rides, or null for styles without a cart. */
  railPath: string | null;
  scroller: RefObject<HTMLElement | null>;
  drawing: RefObject<HTMLElement | null>;
  /** Plays a sound as each part of the ride begins, or null when sound is off. */
  sound: RideSoundPlayer | null;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MS_PER_SECOND = 1000;
const HALF = 2;
const FIRST_STOP = 0;
const NO_STOP = -1;
const NO_STEP = -1;

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function useRidePlayback({ track, railPath, scroller, drawing, sound }: PlaybackOptions): RidePlayback {
  const [ride, setRide] = useState<ActiveRide | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("playing");
  const [stopIndex, setStopIndex] = useState<number | null>(null);
  const cartRef = useRef<SVGGElement | null>(null);
  const elapsed = useRef(0);
  const shownStop = useRef(NO_STOP);
  const soundedStep = useRef(NO_STEP);
  const isActive = ride !== null && ride.track === track;

  /** Sounds the part of the ride that has just begun, or the finish, once each. */
  function playNewStep(active: ActiveRide, isFinished: boolean): void {
    const step = stepIndexAt(active.timeline.steps, elapsed.current);
    if (step === soundedStep.current) {
      return;
    }
    soundedStep.current = step;
    const cue = isFinished
      ? FINISH_CUE
      : cueForStep(active.timeline.steps[step], { samples: active.samples, stops: active.track.stops, trackHeight: active.track.height });
    if (cue !== null) {
      sound?.play(cue);
    }
  }

  /** Puts the cart and the view where the clock says, and reports a new stop or the end to React. */
  function render(active: ActiveRide): boolean {
    const position = positionAt(active.timeline, elapsed.current);
    const pose = poseAt(active.samples, position.length);
    cartRef.current?.setAttribute("transform", `translate(${pose.x} ${pose.y}) rotate(${pose.angle})`);
    const box = scroller.current;
    const width = drawing.current?.clientWidth ?? 0;
    if (box && width > 0) {
      box.scrollTo({ left: pose.x * (width / active.track.width) - box.clientWidth / HALF });
    }
    playNewStep(active, position.isFinished);
    const index = position.stopIndex ?? NO_STOP;
    if (index !== shownStop.current) {
      shownStop.current = index;
      setStopIndex(position.stopIndex);
    }
    return position.isFinished;
  }

  useEffect(() => {
    if (!isActive || status !== "playing") {
      return;
    }
    let frame = 0;
    let last: number | null = null;
    const tick = (time: number): void => {
      elapsed.current += last === null ? 0 : (time - last) / MS_PER_SECOND;
      last = time;
      if (render(ride)) {
        setStatus("finished");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  });

  function jumpTo(seconds: number): void {
    if (!isActive) {
      return;
    }
    sound?.stop();
    soundedStep.current = NO_STEP;
    elapsed.current = Math.min(Math.max(seconds, 0), ride.timeline.duration);
    const isFinished = render(ride);
    if (isFinished) {
      setStatus("finished");
    } else if (status === "finished") {
      setStatus("playing");
    }
  }

  function start(): void {
    const samples = railSamples(railPath, track.stops);
    const isInstant = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const timeline = buildTimeline(samples, track.stops, { trackHeight: track.height, isInstant });
    sound?.stop();
    elapsed.current = 0;
    shownStop.current = NO_STOP;
    soundedStep.current = NO_STEP;
    setStopIndex(null);
    setStatus("playing");
    setRide({ track, samples, timeline });
    drawing.current?.scrollIntoView({ block: "nearest" });
  }

  function togglePause(): void {
    if (status === "finished") {
      start();
      return;
    }
    if (status === "playing") {
      sound?.stop();
    }
    setStatus(status === "playing" ? "paused" : "playing");
  }

  function next(): void {
    if (isActive) {
      const target = (stopIndex ?? NO_STOP) + 1;
      jumpTo(target < track.stops.length ? stopStartTime(ride.timeline, target) : ride.timeline.duration);
    }
  }

  function back(): void {
    if (isActive) {
      jumpTo(stopStartTime(ride.timeline, Math.max((stopIndex ?? FIRST_STOP) - 1, FIRST_STOP)));
    }
  }

  function exit(): void {
    sound?.stop();
    setRide(null);
    setStopIndex(null);
  }

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const keys: Record<string, () => void> = {
      " ": togglePause,
      ArrowRight: next,
      ArrowLeft: back,
      Escape: exit,
    };
    const onKey = (event: KeyboardEvent): void => {
      const action = keys[event.key];
      if (action && !isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return {
    status: isActive ? status : null,
    stopIndex: isActive ? stopIndex : null,
    cartRef,
    start,
    togglePause,
    next,
    back,
    exit,
  };
}
