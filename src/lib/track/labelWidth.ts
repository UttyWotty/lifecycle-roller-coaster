/**
 * Estimated width of the label pill drawn at each stop, from its title and date.
 * The track generators read it to keep neighbouring labels apart, and the scene layout reads it to draw them.
 * It is plain arithmetic on character counts, so it needs no fonts or browser measurement.
 */

const PILL_PADDING = 14;
const CHARACTER_WIDTH = 7;
/** Shown in place of a missing date, on the ride and in the label size estimate. */
export const UNKNOWN_DATE = "Date unknown";

export function pillWidth(title: string, date: string): number {
  return Math.max(title.length, date.length) * CHARACTER_WIDTH + PILL_PADDING * 2;
}

/** The width of a stop's label, using the unknown-date text when the date is missing. */
export function labelWidth(title: string, date: string | null): number {
  return pillWidth(title, date ?? UNKNOWN_DATE);
}
