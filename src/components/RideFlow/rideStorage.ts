/**
 * Thin browser adapter that keeps the shelf of saved rides in the visitor's local storage and tells listeners when it changes.
 * It only reads, writes and removes text; rideShelf.ts and savedRide.ts decide what a ride looks like and whether to trust it.
 * Storage can be missing, full or blocked, so every access is guarded and a failure means "nothing saved".
 */
import { parseSavedRide, toSavedRide, type SavedRide, type SavedRideContent } from "@/lib/saved/savedRide";
import {
  EMPTY_SHELF,
  activeRide,
  openRide,
  parseShelf,
  putRide,
  removeRide,
  serializeShelf,
  shelfFromSingle,
  type RideShelf,
} from "@/lib/saved/rideShelf";

const SHELF_KEY = "lifecycle-roller-coaster:rides";
/** Where versions before the shelf kept their one saved ride; it is moved onto the shelf once, then removed. */
const SINGLE_RIDE_KEY = "lifecycle-roller-coaster:ride";

const listeners = new Set<() => void>();
let cached: { text: string | null; shelf: RideShelf } | null = null;

function currentYear(): number {
  return new Date().getFullYear();
}

export function newRideId(): string {
  return crypto.randomUUID();
}

function readText(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes the shelf and tells listeners; false when storage refused it. */
function writeShelf(shelf: RideShelf): boolean {
  try {
    window.localStorage.setItem(SHELF_KEY, serializeShelf(shelf));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

/** Moves a single saved ride from an older version onto the shelf, the first time the shelf is read. */
function moveSingleRide(): void {
  const single = readText(SINGLE_RIDE_KEY);
  if (single === null || readText(SHELF_KEY) !== null) {
    return;
  }
  if (!writeShelf(shelfFromSingle(parseSavedRide(single, currentYear()), newRideId(), Date.now()))) {
    return;
  }
  try {
    window.localStorage.removeItem(SINGLE_RIDE_KEY);
  } catch {
    return;
  }
}

/** The saved shelf; the same object while storage is unchanged, so React can subscribe to it. */
export function loadShelf(): RideShelf {
  moveSingleRide();
  const text = readText(SHELF_KEY);
  if (cached === null || cached.text !== text) {
    cached = { text, shelf: parseShelf(text, currentYear()) };
  }
  return cached.shelf;
}

export function emptyShelf(): RideShelf {
  return EMPTY_SHELF;
}

export function subscribeToShelf(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The ride that is open on this device, for anything that pairs or shows "my ride". */
export function loadSavedRide(): SavedRide | null {
  return activeRide(loadShelf());
}

export function loadRide(id: string): SavedRide | null {
  return loadShelf().rides.find((entry) => entry.id === id)?.ride ?? null;
}

/** Saves a ride under its id and makes it the open one; an invalid ride, or a new one on a full shelf, is not saved. */
export function saveRide(id: string, content: SavedRideContent): void {
  const ride = toSavedRide(content);
  if (ride === null) {
    return;
  }
  const shelf = putRide(loadShelf(), id, ride, Date.now());
  writeShelf(shelf.rides.some((entry) => entry.id === id) ? openRide(shelf, id) : shelf);
}

export function deleteRide(id: string): void {
  writeShelf(removeRide(loadShelf(), id));
}

/** Remembers which ride is open, so a reload opens it again. */
export function rememberOpenRide(id: string): void {
  writeShelf(openRide(loadShelf(), id));
}
