/**
 * Friendly messages for each way extraction can fail, in the visitor's language.
 * Error codes come from the server, and this module turns them into a message key the interface translates.
 * The module is pure, and unknown codes fall back to a general message.
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { ExtractErrorCode } from "./extractRequest";

export const FALLBACK_MESSAGE_KEY: MessageKey = "story.errorFallback";

/** Shown when the browser cannot reach the server at all. */
export const NETWORK_MESSAGE_KEY: MessageKey = "story.errorNetwork";

const MESSAGE_KEYS: Readonly<Record<ExtractErrorCode, MessageKey>> = {
  refused: "story.errorRefused",
  truncated: "story.errorTruncated",
  rate_limited: "story.errorRateLimited",
  visitor_limit: "story.errorVisitorLimit",
  daily_limit: "story.errorDailyLimit",
  forbidden: "story.errorForbidden",
  not_configured: "story.errorNotConfigured",
  provider_failed: FALLBACK_MESSAGE_KEY,
  invalid_request: FALLBACK_MESSAGE_KEY,
  payload_too_large: "story.errorTooLarge",
  unsupported_media_type: FALLBACK_MESSAGE_KEY,
};

/** The message key for a server error code; anything that is not a known code gets the fallback. */
export function getExtractionMessageKey(code: unknown): MessageKey {
  if (typeof code === "string" && Object.hasOwn(MESSAGE_KEYS, code)) {
    return MESSAGE_KEYS[code as ExtractErrorCode];
  }
  return FALLBACK_MESSAGE_KEY;
}

/** The message for a server error code in one language; the locale defaults to English (DEFAULT_LOCALE). */
export function getExtractionMessage(code: unknown, locale: Locale = DEFAULT_LOCALE): string {
  return translate(locale, getExtractionMessageKey(code));
}
