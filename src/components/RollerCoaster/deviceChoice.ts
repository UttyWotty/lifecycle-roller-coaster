/**
 * An on/off choice remembered on this device, such as Non-stop or Music, that every part of the page sees the same way.
 * Each choice starts off, and reading or saving it never throws: where storage is blocked, it lasts only for this page.
 * Components follow it with a hook, and code outside React, such as the video recorder, reads it when it starts.
 */
"use client";

import { useSyncExternalStore } from "react";

const ON = "on";
const OFF = "off";
/** Every device choice is off unless the user turns it on. */
const DEFAULT_CHOICE = false;

export interface DeviceChoiceState {
  isOn: boolean;
  toggle: () => void;
}

export interface DeviceChoice {
  /** The current value, for code that reads it once, such as when a recording starts. */
  isOn: () => boolean;
  set: (isOn: boolean) => void;
  useChoice: () => DeviceChoiceState;
}

export function createDeviceChoice(key: string): DeviceChoice {
  const listeners = new Set<() => void>();
  /** The choice for this page when storage cannot keep it, or null to read it from storage. */
  let pageChoice: boolean | null = null;

  function isOn(): boolean {
    if (pageChoice !== null) {
      return pageChoice;
    }
    try {
      return window.localStorage.getItem(key) === ON;
    } catch {
      return DEFAULT_CHOICE;
    }
  }

  function set(next: boolean): void {
    pageChoice = next;
    try {
      window.localStorage.setItem(key, next ? ON : OFF);
    } catch {
      // Storage can be blocked; the choice then lasts only for this page.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useChoice(): DeviceChoiceState {
    const value = useSyncExternalStore(subscribe, isOn, () => DEFAULT_CHOICE);
    return { isOn: value, toggle: () => set(!value) };
  }

  return { isOn, set, useChoice };
}
