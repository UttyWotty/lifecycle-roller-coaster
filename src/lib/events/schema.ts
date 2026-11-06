/**
 * Event schema shared by AI extraction, manual entry and the rendering engine.
 * It validates events with zod and infers the TypeScript types from those schemas.
 * This module stays pure and must not import AI or UI code, which keeps those layers independent.
 */
import { z } from "zod";

export const EVENT_CATEGORIES = [
  "education",
  "career",
  "relationships",
  "finance",
  "business",
  "personal",
  "health",
  "other",
] as const;

export const EVENT_SENTIMENTS = ["positive", "negative", "neutral"] as const;

export const IMPACT_MIN = 1;
export const IMPACT_MAX = 10;
export const CONFIDENCE_MIN = 0;
export const CONFIDENCE_MAX = 1;

/** Matches YYYY, YYYY-MM or YYYY-MM-DD, because users often remember only part of a date. */
const PARTIAL_DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

const DUPLICATE_ID_MESSAGE = "Event ids must be unique";
const IMPOSSIBLE_DATE_MESSAGE = "Date does not exist";
const FIRST_MONTH = 1;
const FIRST_DAY = 1;

/** Confirms a partial date exists on the calendar, which rejects values such as 2015-02-31. */
function isCalendarDate(date: string): boolean {
  const [year, month = FIRST_MONTH, day = FIRST_DAY] = date.split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return calendarDate.getUTCMonth() === month - 1 && calendarDate.getUTCDate() === day;
}

export const lifeEventSchema = z.object({
  id: z.string().min(1),
  /** A null date means the event is unknown in time and gets approximate placement. */
  date: z
    .string()
    .regex(PARTIAL_DATE)
    .refine(isCalendarDate, IMPOSSIBLE_DATE_MESSAGE)
    .nullable(),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(EVENT_CATEGORIES),
  /** Direction of the experience, independent of how significant it was. */
  sentiment: z.enum(EVENT_SENTIMENTS),
  /** Significance of the experience, independent of its direction. */
  impact: z.number().int().min(IMPACT_MIN).max(IMPACT_MAX),
  /** Certainty of the interpretation, so uncertain readings are never presented as facts. */
  confidence: z.number().min(CONFIDENCE_MIN).max(CONFIDENCE_MAX),
});

export const lifeEventListSchema = z
  .object({ events: z.array(lifeEventSchema) })
  .superRefine(({ events }, context) => {
    const seenIds = new Set<string>();
    events.forEach(({ id }, index) => {
      if (seenIds.has(id)) {
        context.addIssue({
          code: "custom",
          message: DUPLICATE_ID_MESSAGE,
          path: ["events", index, "id"],
        });
      }
      seenIds.add(id);
    });
  });

export type LifeEvent = z.infer<typeof lifeEventSchema>;
export type LifeEventList = z.infer<typeof lifeEventListSchema>;
