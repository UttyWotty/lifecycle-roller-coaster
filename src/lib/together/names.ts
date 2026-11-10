/**
 * Pure wording for naming the people in a ride together.
 * It joins names the way people say them, with commas and a final "and".
 * It is shared by the together page and its share message, and words them in the given language (English by default).
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

const PAIR = 2;

/** "A", "A and B", or "A, B and C", in the given language (English, DEFAULT_LOCALE, unless one is passed). */
export function namesInWords(names: readonly string[], locale: Locale = DEFAULT_LOCALE): string {
  if (names.length < PAIR) {
    return names[0] ?? "";
  }
  const rest = names.slice(0, -1).join(translate(locale, "together.namesSeparator"));
  return translate(locale, "together.namesJoined", { rest, last: names.at(-1) ?? "" });
}
