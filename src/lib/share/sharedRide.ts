/**
 * Pure encoding of a ride into the fragment of a share link, and strict decoding of one back into a ride.
 * The link carries event titles, dates, feelings, sizes and categories, chapter names, the ride title and its look;
 * by the owner's choice it has no place for descriptions, the life report, clarifications or the story itself.
 * Links come from anyone, so decoding caps the length, validates every field and returns null for anything off.
 */
import { z } from "zod";
import { lifeEventListSchema, EVENT_CATEGORIES, EVENT_SENTIMENTS, type LifeEvent } from "@/lib/events/schema";
import type { LifeChapter } from "@/lib/events/insights";
import { RIDERS, type Rider } from "@/lib/scene/riders";
import { RIDE_THEMES, type RideTheme } from "@/lib/scene/themes";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";

export const SHARED_RIDE_VERSION = 1;
/** The fragment starts with this key, so other fragments are never mistaken for a ride. */
export const SHARE_FRAGMENT_KEY = "r=";
/** Far above any real ride, and short enough that decoding a hostile link stays cheap. */
export const MAX_FRAGMENT_LENGTH = 40_000;
const MAX_EVENTS = 100;
const MAX_EVENT_TITLE = 200;
const MAX_CHAPTERS = 20;
const MAX_CHAPTER_TITLE = 120;
const SHARED_CONFIDENCE = 1;
const NO_DATE = "";
const ID_PREFIX = "shared_";

export interface SharedRide {
  title: string;
  style: RideStyle;
  theme: RideTheme;
  rider: Rider;
  events: LifeEvent[];
  chapters: LifeChapter[];
}

export interface SharedRideInput {
  title: string;
  style: RideStyle;
  theme: RideTheme;
  rider: Rider;
  events: readonly LifeEvent[];
  chapters: readonly LifeChapter[];
}

const compactSchema = z.object({
  v: z.literal(SHARED_RIDE_VERSION),
  t: z.string().max(MAX_TITLE_LENGTH),
  s: z.enum(RIDE_STYLES),
  h: z.enum(RIDE_THEMES),
  r: z.enum(RIDERS),
  e: z
    .array(
      z.tuple([
        z.string().min(1).max(MAX_EVENT_TITLE),
        z.string(),
        z.number().int().min(0).max(EVENT_CATEGORIES.length - 1),
        z.number().int().min(0).max(EVENT_SENTIMENTS.length - 1),
        z.number().int(),
      ]),
    )
    .min(1)
    .max(MAX_EVENTS),
  c: z
    .array(z.tuple([z.string().min(1).max(MAX_CHAPTER_TITLE), z.array(z.number().int().min(0)).max(MAX_EVENTS)]))
    .max(MAX_CHAPTERS),
});

type CompactRide = z.infer<typeof compactSchema>;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** The fragment for a ride, starting with the share key and without the leading "#". */
export function encodeSharedRide(ride: SharedRideInput): string {
  const indexOf = new Map(ride.events.map((event, index) => [event.id, index]));
  const compact: CompactRide = {
    v: SHARED_RIDE_VERSION,
    t: ride.title.slice(0, MAX_TITLE_LENGTH),
    s: ride.style,
    h: ride.theme,
    r: ride.rider,
    e: ride.events.map((event) => [
      event.title.slice(0, MAX_EVENT_TITLE),
      event.date ?? NO_DATE,
      EVENT_CATEGORIES.indexOf(event.category),
      EVENT_SENTIMENTS.indexOf(event.sentiment),
      event.impact,
    ]),
    c: ride.chapters.slice(0, MAX_CHAPTERS).flatMap((chapter): CompactRide["c"] => {
      const indexes = chapter.eventIds.flatMap((id) => {
        const index = indexOf.get(id);
        return index === undefined ? [] : [index];
      });
      return indexes.length > 0 ? [[chapter.title.slice(0, MAX_CHAPTER_TITLE), indexes]] : [];
    }),
  };
  return `${SHARE_FRAGMENT_KEY}${toBase64Url(JSON.stringify(compact))}`;
}

function expand(compact: CompactRide): SharedRide | null {
  const events: LifeEvent[] = compact.e.map(([title, date, category, sentiment, impact], index) => ({
    id: `${ID_PREFIX}${index}`,
    date: date === NO_DATE ? null : date,
    title,
    description: "",
    category: EVENT_CATEGORIES[category],
    sentiment: EVENT_SENTIMENTS[sentiment],
    impact,
    confidence: SHARED_CONFIDENCE,
  }));
  if (!lifeEventListSchema.safeParse({ events }).success) {
    return null;
  }
  const chapters = compact.c.flatMap(([title, indexes]) => {
    const eventIds = indexes.filter((index) => index < events.length).map((index) => events[index].id);
    return eventIds.length > 0 ? [{ title, eventIds }] : [];
  });
  return { title: compact.t, style: compact.s, theme: compact.h, rider: compact.r, events, chapters };
}

/** Reads a ride from a fragment, with or without its leading "#", or null when it is not a valid ride. */
export function decodeSharedRide(fragment: string): SharedRide | null {
  const body = fragment.replace(/^#/, "");
  if (!body.startsWith(SHARE_FRAGMENT_KEY) || body.length > MAX_FRAGMENT_LENGTH) {
    return null;
  }
  try {
    const result = compactSchema.safeParse(JSON.parse(fromBase64Url(body.slice(SHARE_FRAGMENT_KEY.length))));
    return result.success ? expand(result.data) : null;
  } catch {
    return null;
  }
}
