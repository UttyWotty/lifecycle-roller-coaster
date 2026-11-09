/**
 * Friendly messages for each way extraction can fail.
 * Error codes come from the server, and this module turns them into plain language.
 * The module is pure, and unknown codes fall back to a general message.
 */
import type { ExtractErrorCode } from "./extractRequest";

const FALLBACK_MESSAGE = "Something went wrong while reading your story. Please try again.";

const MESSAGES: Readonly<Record<ExtractErrorCode, string>> = {
  refused:
    "We could not turn this story into a ride. You did nothing wrong. Rewording it or leaving out a part may help.",
  truncated: "This story has more events than we can read at once. Please try a shorter version.",
  rate_limited: "The ride is very busy right now. Please try again in a minute.",
  visitor_limit:
    "You have made a lot of rides in a short time. Please take a break and try again later, or explore a sample life.",
  daily_limit:
    "Today's free story readings are used up. Please come back tomorrow, or explore a sample life in the meantime.",
  forbidden: "This request looked automated, so it was blocked. Please reload the page and try again.",
  not_configured: "The story reader is not set up on this server yet.",
  provider_failed: FALLBACK_MESSAGE,
  invalid_request: FALLBACK_MESSAGE,
  payload_too_large: "This story is too long to send. Please shorten it and try again.",
  unsupported_media_type: FALLBACK_MESSAGE,
};

export function getExtractionMessage(code: unknown): string {
  if (typeof code === "string" && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as ExtractErrorCode];
  }
  return FALLBACK_MESSAGE;
}
