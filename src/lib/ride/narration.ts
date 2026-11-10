/**
 * Pure text for the narrated ride: what the voice says as the cart reaches each stop, and at the end, in one language.
 * Dates are written the way people say them, so "2015-03" is read as "March 2015" rather than as a sum.
 * It only builds words; the browser hook hands them to the device's own speech voice in the same language.
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { shownDate } from "@/lib/track/labelWidth";

/** The English closing line; narrationEnd gives it in other languages. */
export const NARRATION_END = translate(DEFAULT_LOCALE, "narration.end");

const MONTHS: readonly MessageKey[] = [
  "narration.month1", "narration.month2", "narration.month3", "narration.month4",
  "narration.month5", "narration.month6", "narration.month7", "narration.month8",
  "narration.month9", "narration.month10", "narration.month11", "narration.month12",
];
const DATE_PARTS_SEPARATOR = "-";
const MONTH_BASE = 1;
const SENTENCE_END = /[.!?]$/;

/**
 * A date as it is spoken: "2015", "March 2015" or "3 March 2015"; an unknown date says so.
 * The words are in the given language, English (DEFAULT_LOCALE) unless one is passed.
 */
export function spokenDate(date: string | null, locale: Locale = DEFAULT_LOCALE): string {
  if (date === null) {
    return shownDate(date, locale);
  }
  const [year, month, day] = date.split(DATE_PARTS_SEPARATOR);
  const monthKey = month === undefined ? undefined : MONTHS[Number(month) - MONTH_BASE];
  if (monthKey === undefined) {
    return year;
  }
  const monthName = translate(locale, monthKey);
  return day === undefined
    ? translate(locale, "narration.monthYear", { month: monthName, year })
    : translate(locale, "narration.dayMonthYear", { day: Number(day), month: monthName, year });
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return SENTENCE_END.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** What the voice says at a stop: its place in the ride, its date and its full title, in the given language. */
export function narrationFor(
  stop: { title: string; date: string | null },
  index: number,
  count: number,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return translate(locale, "narration.stop", {
    number: index + 1,
    count,
    date: spokenDate(stop.date, locale),
    title: sentence(stop.title),
  });
}

/** What the voice says when the ride ends, in the given language. */
export function narrationEnd(locale: Locale = DEFAULT_LOCALE): string {
  return translate(locale, "narration.end");
}
