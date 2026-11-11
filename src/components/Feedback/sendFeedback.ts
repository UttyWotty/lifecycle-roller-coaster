/**
 * Browser adapter that posts one feedback message to the app's own feedback route.
 * It sends only the chosen reaction, the typed words and the language, and nothing about the ride or the story.
 * It answers with "sent" or the message key that explains the problem, so the form never shows raw errors.
 */
import { MAX_MESSAGE_LENGTH, type Reaction } from "@/lib/feedback/feedback";
import type { Locale } from "@/lib/i18n/locales";
import type { MessageKey } from "@/lib/i18n/messages";

const ENDPOINT = "/api/feedback";
const SENT = "sent";

export type FeedbackOutcome = typeof SENT | MessageKey;

/** The words for each error the route can answer with; anything else reads as "try again later". */
const ERROR_KEYS: Readonly<Record<string, MessageKey>> = {
  invalid: "feedback.chooseReaction",
  too_long: "feedback.tooLong",
  payload_too_large: "feedback.tooLong",
  rate_limited: "feedback.rateLimited",
};
const FALLBACK_ERROR: MessageKey = "feedback.unavailable";

export async function sendFeedback(reaction: Reaction, message: string, locale: Locale): Promise<FeedbackOutcome> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction, message: message.slice(0, MAX_MESSAGE_LENGTH * 2), locale }),
    });
  } catch {
    return "feedback.offline";
  }
  if (response.ok) {
    return SENT;
  }
  const body: unknown = await response.json().catch(() => null);
  const code = body !== null && typeof body === "object" && "error" in body ? String(body.error) : "";
  return ERROR_KEYS[code] ?? FALLBACK_ERROR;
}

export function isSent(outcome: FeedbackOutcome): boolean {
  return outcome === SENT;
}
