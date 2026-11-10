/**
 * Pure shape of a ride saved on the visitor's own device, with the rules for reading it back.
 * It holds the events, insights, look and lens of a ride, and deliberately has no field for the story text the user typed.
 * Anything missing, corrupt, from another version or invalid reads back as no saved ride, so storage is never trusted.
 */
import { z } from "zod";
import { lifeChapterSchema, lifeReportSchema, type LifeChapter } from "@/lib/events/insights";
import { lifeEventListSchema, type LifeEvent } from "@/lib/events/schema";
import { isPlausibleBirthYear } from "@/lib/lenses/rideLenses";
import { RIDERS } from "@/lib/scene/riders";
import { RIDE_THEMES } from "@/lib/scene/themes";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RIDE_STYLES } from "@/lib/track/types";

/** Raised whenever the saved shape changes, so an older save is dropped instead of misread. */
export const SAVED_RIDE_VERSION = 1;
/** Lens ids are short, such as "decade:2010"; anything longer did not come from the app. */
const MAX_LENS_ID_LENGTH = 40;

const savedRideSchema = z.object({
  version: z.literal(SAVED_RIDE_VERSION),
  events: lifeEventListSchema.shape.events,
  chapters: z.array(lifeChapterSchema),
  report: lifeReportSchema.nullable(),
  clarifications: z.array(z.string()),
  isDemo: z.boolean(),
  title: z.string().max(MAX_TITLE_LENGTH),
  style: z.enum(RIDE_STYLES),
  theme: z.enum(RIDE_THEMES),
  rider: z.enum(RIDERS),
  fitToScreen: z.boolean(),
  lens: z.string().max(MAX_LENS_ID_LENGTH),
  birthYear: z.number().int().nullable(),
});

export type SavedRide = z.infer<typeof savedRideSchema>;
/** What the app hands over to save; lists are read-only, as they are in the ride state. */
export type SavedRideContent = Omit<SavedRide, "version" | "events" | "chapters" | "clarifications"> & {
  events: readonly LifeEvent[];
  chapters: readonly LifeChapter[];
  clarifications: readonly string[];
};

/** A ride is worth saving only when it has events and every one of them is complete and valid. */
export function canSaveEvents(events: readonly LifeEvent[]): boolean {
  return events.length > 0 && lifeEventListSchema.safeParse({ events }).success;
}

/**
 * Keeps only the fields of the saved shape, so nothing else, such as story text, can slip into storage.
 * Returns null for a ride that would not read back, so an invalid ride never replaces the last good save.
 */
export function toSavedRide(content: SavedRideContent): SavedRide | null {
  const result = savedRideSchema.safeParse({ ...content, version: SAVED_RIDE_VERSION });
  return result.success && canSaveEvents(result.data.events) ? result.data : null;
}

/** The saved ride as text, or null when it would not read back. */
export function serializeRide(content: SavedRideContent): string | null {
  const ride = toSavedRide(content);
  return ride === null ? null : JSON.stringify(ride);
}

/**
 * Reads a saved ride back, or null when there is none or it cannot be trusted. A birth year that no person could
 * have is dropped rather than the whole ride, checked against the current year the caller passes in.
 */
export function parseSavedRide(text: string | null, currentYear: number): SavedRide | null {
  if (text === null) {
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  return readSavedRide(data, currentYear);
}

/** Reads a ride from already-parsed data, such as one entry of the saved-ride shelf, with the same rules. */
export function readSavedRide(data: unknown, currentYear: number): SavedRide | null {
  const result = savedRideSchema.safeParse(data);
  if (!result.success || !canSaveEvents(result.data.events)) {
    return null;
  }
  const { birthYear } = result.data;
  const isPlausible = birthYear !== null && isPlausibleBirthYear(birthYear, currentYear);
  return { ...result.data, birthYear: isPlausible ? birthYear : null };
}
