/**
 * Pure shape of the shelf of rides saved on the visitor's own device: up to MAX_SAVED_RIDES rides and which one is open.
 * It reads each ride with the saved-ride rules and drops a bad entry on its own, so one broken ride never loses the rest.
 * It also names each ride for the My rides list and moves an older single save onto the shelf.
 */
import { z } from "zod";
import { readSavedRide, type SavedRide } from "./savedRide";

/** Raised whenever the shelf's own shape changes, so an older shelf is dropped instead of misread. */
export const SHELF_VERSION = 1;
/** Enough for a life, a career and a few family stories, and well inside the browser's storage. */
export const MAX_SAVED_RIDES = 12;
/** Ride ids are made by the app and short; anything longer did not come from it. */
const MAX_RIDE_ID_LENGTH = 64;
export const UNTITLED_RIDE = "Untitled ride";
const YEAR_DIGITS = 4;

export interface ShelfEntry {
  id: string;
  /** When the ride was last saved, in milliseconds since 1970, for listing the newest first. */
  savedAt: number;
  ride: SavedRide;
}

export interface RideShelf {
  /** The ride the app opens, which may not be saved yet when it is a new ride without events. */
  activeId: string | null;
  rides: ShelfEntry[];
}

export interface RideSummary {
  id: string;
  name: string;
  /** The span of the ride's dated stops, such as "2012 to 2026", or null when none is dated. */
  years: string | null;
  stopCount: number;
  isOpen: boolean;
}

export const EMPTY_SHELF: RideShelf = { activeId: null, rides: [] };

const rideIdSchema = z.string().min(1).max(MAX_RIDE_ID_LENGTH);
const shelfSchema = z.object({
  version: z.literal(SHELF_VERSION),
  activeId: rideIdSchema.nullable(),
  rides: z.array(z.object({ id: rideIdSchema, savedAt: z.number().finite(), ride: z.unknown() })),
});

/** Reads a shelf back; anything corrupt reads as an empty shelf, and each bad or repeated ride is dropped alone. */
export function parseShelf(text: string | null, currentYear: number): RideShelf {
  if (text === null) {
    return EMPTY_SHELF;
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return EMPTY_SHELF;
  }
  const result = shelfSchema.safeParse(data);
  if (!result.success) {
    return EMPTY_SHELF;
  }
  const seen = new Set<string>();
  const rides = result.data.rides.flatMap(({ id, savedAt, ride }) => {
    const read = readSavedRide(ride, currentYear);
    if (read === null || seen.has(id)) {
      return [];
    }
    seen.add(id);
    return [{ id, savedAt, ride: read }];
  });
  return { activeId: result.data.activeId, rides: rides.slice(0, MAX_SAVED_RIDES) };
}

export function serializeShelf(shelf: RideShelf): string {
  return JSON.stringify({ version: SHELF_VERSION, ...shelf });
}

/** The ride that is open, or null when it is new and not saved yet. */
export function activeRide(shelf: RideShelf): SavedRide | null {
  return shelf.rides.find(({ id }) => id === shelf.activeId)?.ride ?? null;
}

export function isShelfFull(shelf: RideShelf): boolean {
  return shelf.rides.length >= MAX_SAVED_RIDES;
}

/** Saves a ride under its id, replacing the one already there; a new ride on a full shelf is not added. */
export function putRide(shelf: RideShelf, id: string, ride: SavedRide, now: number): RideShelf {
  const exists = shelf.rides.some((entry) => entry.id === id);
  if (!exists && isShelfFull(shelf)) {
    return shelf;
  }
  const entry = { id, savedAt: now, ride };
  return { ...shelf, rides: exists ? shelf.rides.map((old) => (old.id === id ? entry : old)) : [...shelf.rides, entry] };
}

/** Removes a ride; when it was the open one, no ride is open afterwards. */
export function removeRide(shelf: RideShelf, id: string): RideShelf {
  return {
    activeId: shelf.activeId === id ? null : shelf.activeId,
    rides: shelf.rides.filter((entry) => entry.id !== id),
  };
}

export function openRide(shelf: RideShelf, id: string | null): RideShelf {
  return { ...shelf, activeId: id };
}

/** Puts an older single save on an empty shelf as its open ride. */
export function shelfFromSingle(single: SavedRide | null, id: string, now: number): RideShelf {
  return single === null ? EMPTY_SHELF : { activeId: id, rides: [{ id, savedAt: now, ride: single }] };
}

function yearSpan(ride: SavedRide): string | null {
  const years = ride.events.flatMap(({ date }) => (date === null ? [] : [Number(date.slice(0, YEAR_DIGITS))])).sort((a, b) => a - b);
  const first = years[0];
  const last = years.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  return first === last ? String(first) : `${first} to ${last}`;
}

/** The rides for the My rides list, the most recently saved first. */
export function summarize(shelf: RideShelf): RideSummary[] {
  return [...shelf.rides]
    .sort((a, b) => b.savedAt - a.savedAt)
    .map(({ id, ride }) => ({
      id,
      name: ride.title.trim() || UNTITLED_RIDE,
      years: yearSpan(ride),
      stopCount: ride.events.length,
      isOpen: id === shelf.activeId,
    }));
}
