/**
 * Which ride-screen sections are open, remembered on this device for the user's own ride.
 * On shared and embed pages they last for that visit only, because those pages store nothing on the viewer's device.
 * Every section starts closed, so a first-time visitor sees the ride and Ride it before anything else.
 */
"use client";

import { useSyncExternalStore } from "react";
import { createDeviceChoice, type DeviceChoice, type DeviceChoiceState } from "@/components/RollerCoaster/deviceChoice";

const KEY_PREFIX = "lifecycle-roller-coaster:open-";

export const FOLD_OUTS = {
  edit: createDeviceChoice(`${KEY_PREFIX}edit`),
  rideOptions: createDeviceChoice(`${KEY_PREFIX}ride-options`),
  makeItYours: createDeviceChoice(`${KEY_PREFIX}make-it-yours`),
  share: createDeviceChoice(`${KEY_PREFIX}share`),
  stats: createDeviceChoice(`${KEY_PREFIX}stats`),
} satisfies Record<string, DeviceChoice>;

/** Sections start closed. */
const CLOSED = false;

/** An open-or-closed choice kept in memory for this page only, never written to the device. */
function createPageChoice(): DeviceChoice {
  const listeners = new Set<() => void>();
  let value = CLOSED;

  function set(next: boolean): void {
    value = next;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useChoice(): DeviceChoiceState {
    const current = useSyncExternalStore(subscribe, () => value, () => CLOSED);
    return { isOn: current, toggle: () => set(!current) };
  }

  return { isOn: () => value, set, useChoice };
}

/** The shared ride and embed pages' sections, which never touch the viewer's storage. */
export const SHARED_FOLD_OUTS = {
  rideOptions: createPageChoice(),
  makeItYours: createPageChoice(),
  share: createPageChoice(),
  stats: createPageChoice(),
} satisfies Record<string, DeviceChoice>;
