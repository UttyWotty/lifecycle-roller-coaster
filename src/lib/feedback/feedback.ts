/**
 * Pure rules for visitor feedback: what a message may contain, what is kept, and how often a visitor may send one.
 * A kept record holds only the reaction, the message, the language, the day and the build, never who sent it.
 * Nothing here performs I/O; the route supplies the store, the clock and the visitor's hashed id.
 */
import { z } from "zod";
import { LOCALES } from "@/lib/i18n/locales";

export const REACTIONS = ["loved", "fine", "confusing"] as const;
export type Reaction = (typeof REACTIONS)[number];

export const MAX_MESSAGE_LENGTH = 1000;
/** A request body over this many bytes is refused before it is read in full. */
export const MAX_FEEDBACK_BODY_BYTES = 4096;
/** Messages one visitor may send per clock hour and per UTC day. */
export const VISITOR_HOURLY_FEEDBACK = 3;
export const VISITOR_DAILY_FEEDBACK = 10;
/** Messages kept from all visitors per UTC day, so the free store can never be filled. */
export const DAILY_FEEDBACK_CAP = 200;
/** Only the newest messages are kept; older ones fall off the end of the list. */
export const KEPT_FEEDBACK = 500;
export const FEEDBACK_LIST_KEY = "lrc:feedback";

const KEY_PREFIX = "lrc:feedback-count";
const DAY_LENGTH = 10;
const HOUR_LENGTH = 13;
export const FEEDBACK_HOUR_TTL_SECONDS = 2 * 60 * 60;
export const FEEDBACK_DAY_TTL_SECONDS = 2 * 24 * 60 * 60;

export const feedbackRequestSchema = z
  .object({
    reaction: z.enum(REACTIONS),
    message: z.string().max(MAX_MESSAGE_LENGTH * 2),
    locale: z.enum(LOCALES),
  })
  .strict();

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

/** Everything that is stored about one message. */
export interface FeedbackRecord {
  reaction: Reaction;
  message: string;
  locale: FeedbackRequest["locale"];
  /** The UTC day it arrived, YYYY-MM-DD; never the time, so messages cannot be matched to visits. */
  day: string;
  /** Which release the visitor was using. */
  build: string;
}

export type FeedbackError = "invalid" | "too_long";

/** Checks a parsed body and turns it into the record to keep, or says why it cannot be kept. */
export function feedbackRecord(body: unknown, now: Date, build: string): FeedbackRecord | FeedbackError {
  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return "invalid";
  }
  const message = parsed.data.message.trim();
  if (Array.from(message).length > MAX_MESSAGE_LENGTH) {
    return "too_long";
  }
  return { reaction: parsed.data.reaction, message, locale: parsed.data.locale, day: now.toISOString().slice(0, DAY_LENGTH), build };
}

export interface FeedbackKeys {
  visitorHour: string;
  visitorDay: string;
  allDay: string;
}

/** Counter keys for the current UTC hour and day. The visitor id is already a one-way hash. */
export function feedbackKeys(visitorId: string, now: Date): FeedbackKeys {
  const stamp = now.toISOString();
  const day = stamp.slice(0, DAY_LENGTH);
  const hour = stamp.slice(0, HOUR_LENGTH);
  return {
    visitorHour: `${KEY_PREFIX}:visitor:${visitorId}:hour:${hour}`,
    visitorDay: `${KEY_PREFIX}:visitor:${visitorId}:day:${day}`,
    allDay: `${KEY_PREFIX}:all:${day}`,
  };
}

export interface FeedbackCounts {
  visitorHour: number;
  visitorDay: number;
  allDay: number;
}

/** True when the counts, including this message, are within every limit. */
export function isWithinFeedbackLimits(counts: FeedbackCounts): boolean {
  return counts.visitorHour <= VISITOR_HOURLY_FEEDBACK && counts.visitorDay <= VISITOR_DAILY_FEEDBACK && counts.allDay <= DAILY_FEEDBACK_CAP;
}
