/**
 * Thin browser adapter that keeps one saved ride in the visitor's local storage.
 * It only reads, writes and removes text; savedRide.ts decides what a ride looks like and whether to trust it.
 * Storage can be missing, full or blocked, so every access is guarded and a failure means "nothing saved".
 */
import { parseSavedRide, serializeRide, type SavedRide, type SavedRideContent } from "@/lib/saved/savedRide";

const STORAGE_KEY = "lifecycle-roller-coaster:ride";

export function loadSavedRide(): SavedRide | null {
  try {
    return parseSavedRide(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Saves the ride when it is valid; an invalid ride leaves the last good save in place. */
export function saveRide(content: SavedRideContent): void {
  const text = serializeRide(content);
  if (text === null) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, text);
  } catch {
    return;
  }
}

export function clearSavedRide(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
