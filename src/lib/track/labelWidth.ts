/**
 * Estimated width of the label pill drawn at each stop, from its title and date.
 * The track generators read it to keep neighbouring labels apart, and the scene layout reads it to draw them.
 * It is plain arithmetic on character counts, so it needs no fonts or browser measurement.
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

const PILL_PADDING = 14;
const CHARACTER_WIDTH = 7;
/**
 * The English text for a missing date, which the label size estimate uses in every language, so a ride is laid out
 * the same whatever language shows it. Every language's text for it is kept no longer than this one.
 */
export const UNKNOWN_DATE = translate(DEFAULT_LOCALE, "ride.dateUnknown");

export function pillWidth(title: string, date: string): number {
  return Math.max(title.length, date.length) * CHARACTER_WIDTH + PILL_PADDING * 2;
}

/** The width of a stop's label, using the unknown-date text when the date is missing. */
export function labelWidth(title: string, date: string | null): number {
  return pillWidth(title, date ?? UNKNOWN_DATE);
}

/** A stop's date as it is shown, or the language's words for a missing date; the locale defaults to English (DEFAULT_LOCALE). */
export function shownDate(date: string | null, locale: Locale = DEFAULT_LOCALE): string {
  return date ?? translate(locale, "ride.dateUnknown");
}
