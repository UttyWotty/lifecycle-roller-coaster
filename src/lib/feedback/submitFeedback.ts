/**
 * Handles one feedback message: checks it, counts it against the limits, and keeps it, given stores as arguments.
 * Checking comes first, so a bad message never uses up a visitor's allowance, and limits come before storing.
 * It returns a status and a body for the route to send, and never includes the message in an error.
 */
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import {
  FEEDBACK_DAY_TTL_SECONDS,
  FEEDBACK_HOUR_TTL_SECONDS,
  feedbackKeys,
  feedbackRecord,
  isWithinFeedbackLimits,
} from "./feedback";
import { FeedbackStoreError, type FeedbackStore } from "./feedbackStore";

export type FeedbackErrorCode = "invalid" | "too_long" | "rate_limited" | "unavailable" | "forbidden" | "payload_too_large";

export interface FeedbackResponse {
  status: number;
  body: { ok: true } | { error: FeedbackErrorCode };
}

export interface FeedbackContext {
  limitStore: LimitStore;
  feedbackStore: FeedbackStore;
  visitorId: string;
  now: Date;
  build: string;
}

const STATUS: Readonly<Record<FeedbackErrorCode | "ok", number>> = {
  ok: 200,
  invalid: 400,
  too_long: 400,
  forbidden: 403,
  payload_too_large: 413,
  rate_limited: 429,
  unavailable: 503,
};
const JSON_TYPE = "application/json";
const ONE = 1;

export function feedbackError(code: FeedbackErrorCode): FeedbackResponse {
  return { status: STATUS[code], body: { error: code } };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function isAllowed(context: FeedbackContext): Promise<boolean> {
  const keys = feedbackKeys(context.visitorId, context.now);
  const [visitorHour, visitorDay, allDay] = await Promise.all([
    context.limitStore.increment(keys.visitorHour, ONE, FEEDBACK_HOUR_TTL_SECONDS),
    context.limitStore.increment(keys.visitorDay, ONE, FEEDBACK_DAY_TTL_SECONDS),
    context.limitStore.increment(keys.allDay, ONE, FEEDBACK_DAY_TTL_SECONDS),
  ]);
  return isWithinFeedbackLimits({ visitorHour, visitorDay, allDay });
}

export async function submitFeedback(contentType: string | null, text: string, context: FeedbackContext): Promise<FeedbackResponse> {
  if (!(contentType ?? "").toLowerCase().startsWith(JSON_TYPE)) {
    return feedbackError("invalid");
  }
  const record = feedbackRecord(parseJson(text), context.now, context.build);
  if (typeof record === "string") {
    return feedbackError(record);
  }
  try {
    if (!(await isAllowed(context))) {
      return feedbackError("rate_limited");
    }
    await context.feedbackStore.add(record);
  } catch (error) {
    if (error instanceof LimitStoreError || error instanceof FeedbackStoreError) {
      return feedbackError("unavailable");
    }
    throw error;
  }
  return { status: STATUS.ok, body: { ok: true } };
}
