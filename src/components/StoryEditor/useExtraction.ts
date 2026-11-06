/**
 * React hook that tracks one extraction request at a time.
 * Starting or resetting cancels any request in flight, so a stale answer can never appear.
 * A successful result goes straight to the caller, which decides where it lives.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { requestExtraction } from "./requestExtraction";

export type ExtractionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

interface UseExtraction {
  state: ExtractionState;
  extract: (story: string, onResult: (result: ExtractionResult) => void) => Promise<void>;
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

  const extract = useCallback<UseExtraction["extract"]>(async (story, onResult) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setState({ status: "loading" });
    const outcome = await requestExtraction(story, controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    if (outcome.ok) {
      setState(IDLE);
      onResult(outcome.result);
    } else {
      setState({ status: "error", message: outcome.message });
    }
  }, []);

  useEffect(() => () => inFlight.current?.abort(), []);

  return { state, extract, reset };
}
