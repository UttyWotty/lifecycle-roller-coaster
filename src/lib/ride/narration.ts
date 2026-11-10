/**
 * Pure text for the narrated ride: what the voice says as the cart reaches each stop, and at the end.
 * Dates are written the way people say them, so "2015-03" is read as "March 2015" rather than as a sum.
 * It only builds words; the browser hook hands them to the device's own speech voice.
 */
import { UNKNOWN_DATE } from "@/lib/track/labelWidth";

export const NARRATION_END = "End of the ride.";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const DATE_PARTS_SEPARATOR = "-";
const MONTH_BASE = 1;
const SENTENCE_END = /[.!?]$/;

/** A date as it is spoken: "2015", "March 2015" or "3 March 2015"; an unknown date says so. */
export function spokenDate(date: string | null): string {
  if (date === null) {
    return UNKNOWN_DATE;
  }
  const [year, month, day] = date.split(DATE_PARTS_SEPARATOR);
  const monthName = month === undefined ? undefined : MONTHS[Number(month) - MONTH_BASE];
  if (monthName === undefined) {
    return year;
  }
  return day === undefined ? `${monthName} ${year}` : `${Number(day)} ${monthName} ${year}`;
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return SENTENCE_END.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** What the voice says at a stop: its place in the ride, its date and its full title. */
export function narrationFor(stop: { title: string; date: string | null }, index: number, count: number): string {
  return `Stop ${index + 1} of ${count}. ${spokenDate(stop.date)}. ${sentence(stop.title)}`;
}
