/**
 * React hook that tracks one extraction request at a time.
 * Starting or resetting cancels any request in flight, so a stale answer can never appear.
 * Results live only in component state and are gone when the page closes.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { requestExtraction } from "./requestExtraction";

export type ExtractionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: ExtractionResult }
  | { status: "error"; message: string };

interface UseExtraction {
  state: ExtractionState;
  extract: (story: string) => Promise<void>;
  reset: () => void;
}

const IDLE: ExtractionState = { status: "idle" };

export function useExtraction(): UseExtraction {
  const [state, setState] = useState<ExtractionState>(IDLE);
  const inFlight = useRef<AbortController | null>(null);

  const reset = useCallback((): void => {
    inFlight.current?.abort();
    inFlight.current = null;
    setState(IDLE);
  }, []);

  const extract = useCallback(async (story: string): Promise<void> => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setState({ status: "loading" });
    const outcome = await requestExtraction(story, controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    setState(
      outcome.ok
        ? { status: "done", result: outcome.result }
        : { status: "error", message: outcome.message },
    );
  }, []);

  useEffect(() => () => inFlight.current?.abort(), []);

  return { state, extract, reset };
}
