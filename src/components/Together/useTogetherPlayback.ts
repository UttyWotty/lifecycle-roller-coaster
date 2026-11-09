/**
 * Browser side of Ride together: one clock moves both carts through time, side by side, and keeps them in view.
 * The ride pauses at each column of the shared timeline, where the card shows what happened to each person.
 * Carts and scrolling change directly in the DOM each frame; React state changes only at a new column or status.
 */
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { buildTimeline, poseAtX, polylineSamples, positionAt, stopStartTime, type Timeline } from "@/lib/ride/ridePlayback";
import type { TogetherColumn } from "@/lib/together/alignRides";
import type { Track } from "@/lib/track/types";
import type { PlaybackStatus } from "@/components/RollerCoaster/useRidePlayback";

export interface TogetherPlayback {
  status: PlaybackStatus | null;
  columnIndex: number | null;
  cartRefs: readonly [RefObject<SVGGElement | null>, RefObject<SVGGElement | null>];
  start: () => void;
  togglePause: () => void;
  next: () => void;
  back: () => void;
  exit: () => void;
}

interface TogetherOptions {
  tracks: readonly [Track, Track];
  columns: readonly TogetherColumn[];
  scroller: RefObject<HTMLElement | null>;
  drawing: RefObject<HTMLElement | null>;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MS_PER_SECOND = 1000;
const HALF = 2;
const NO_COLUMN = -1;
/** Moves along a level line, so only distance in time sets the pace between columns. */
const LEVEL = 0;
const TIMELINE_HEIGHT = 1;

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function useTogetherPlayback({ tracks, columns, scroller, drawing }: TogetherOptions): TogetherPlayback {
  const [timeline, setTimeline] = useState<{ value: Timeline; startX: number; tracks: readonly [Track, Track] } | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("playing");
  const [columnIndex, setColumnIndex] = useState<number | null>(null);
  const cartA = useRef<SVGGElement | null>(null);
  const cartB = useRef<SVGGElement | null>(null);
  const elapsed = useRef(0);
  const shown = useRef(NO_COLUMN);
  const isActive = timeline !== null && timeline.tracks[0] === tracks[0] && timeline.tracks[1] === tracks[1];

  function render(active: NonNullable<typeof timeline>): boolean {
    const position = positionAt(active.value, elapsed.current);
    const x = active.startX + position.length;
    [cartA, cartB].forEach((cart, index) => {
      const pose = poseAtX(active.tracks[index].profile, x);
      cart.current?.setAttribute("transform", `translate(${pose.x} ${pose.y}) rotate(${pose.angle})`);
    });
    const box = scroller.current;
    const width = drawing.current?.clientWidth ?? 0;
    if (box && width > 0) {
      box.scrollTo({ left: x * (width / active.tracks[0].width) - box.clientWidth / HALF });
    }
    const index = position.stopIndex ?? NO_COLUMN;
    if (index !== shown.current) {
      shown.current = index;
      setColumnIndex(position.stopIndex);
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
      if (render(timeline)) {
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
    elapsed.current = Math.min(Math.max(seconds, 0), timeline.value.duration);
    if (render(timeline)) {
      setStatus("finished");
    } else if (status === "finished") {
      setStatus("playing");
    }
  }

  function start(): void {
    const startX = Math.min(...tracks.map((track) => track.profile[0]?.x ?? 0));
    const endX = Math.max(...tracks.map((track) => track.profile.at(-1)?.x ?? 0));
    const stops = columns.map(({ x }) => ({ x, y: LEVEL }));
    const samples = polylineSamples([{ x: startX, y: LEVEL }, ...stops, { x: endX, y: LEVEL }]);
    const isInstant = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const value = buildTimeline(samples, stops, { trackHeight: TIMELINE_HEIGHT, isInstant });
    elapsed.current = 0;
    shown.current = NO_COLUMN;
    setColumnIndex(null);
    setStatus("playing");
    setTimeline({ value, startX, tracks });
    drawing.current?.scrollIntoView({ block: "nearest" });
  }

  function togglePause(): void {
    if (status === "finished") {
      start();
      return;
    }
    setStatus(status === "playing" ? "paused" : "playing");
  }

  function next(): void {
    if (isActive) {
      const target = (columnIndex ?? NO_COLUMN) + 1;
      jumpTo(target < columns.length ? stopStartTime(timeline.value, target) : timeline.value.duration);
    }
  }

  function back(): void {
    if (isActive) {
      jumpTo(stopStartTime(timeline.value, Math.max((columnIndex ?? 0) - 1, 0)));
    }
  }

  function exit(): void {
    setTimeline(null);
    setColumnIndex(null);
  }

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const keys: Record<string, () => void> = { " ": togglePause, ArrowRight: next, ArrowLeft: back, Escape: exit };
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
    columnIndex: isActive ? columnIndex : null,
    cartRefs: [cartA, cartB],
    start,
    togglePause,
    next,
    back,
    exit,
  };
}
