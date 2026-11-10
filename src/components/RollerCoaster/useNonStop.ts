/**
 * Browser state for the Non-stop choice, which makes Ride it and the ride video roll through every stop without pausing.
 * The choice starts off and is remembered on this device, and every part of the page reading it sees the same value.
 * Reading or saving it never throws: where storage is blocked, the choice lasts only for this page.
 */
"use client";

import { useSyncExternalStore } from "react";

const NON_STOP_KEY = "lifecycle-roller-coaster:non-stop";
const NON_STOP_ON = "on";
const NON_STOP_OFF = "off";
/** Non-stop is off unless the user turns it on. */
const DEFAULT_NON_STOP = false;

export interface NonStop {
  isOn: boolean;
  toggle: () => void;
}

const listeners = new Set<() => void>();
/** The choice for this page when storage cannot keep it, or null to read it from storage. */
let pageChoice: boolean | null = null;

/** Whether Non-stop is on, from this page's choice or the one saved on the device. */
export function isNonStopOn(): boolean {
  if (pageChoice !== null) {
    return pageChoice;
  }
  try {
    return window.localStorage.getItem(NON_STOP_KEY) === NON_STOP_ON;
  } catch {
    return DEFAULT_NON_STOP;
  }
}

function setNonStop(isOn: boolean): void {
  pageChoice = isOn;
  try {
    window.localStorage.setItem(NON_STOP_KEY, isOn ? NON_STOP_ON : NON_STOP_OFF);
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function serverValue(): boolean {
  return DEFAULT_NON_STOP;
}

export function useNonStop(): NonStop {
  const isOn = useSyncExternalStore(subscribe, isNonStopOn, serverValue);
  return { isOn, toggle: () => setNonStop(!isOn) };
}
