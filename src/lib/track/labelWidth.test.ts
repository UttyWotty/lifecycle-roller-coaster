/**
 * Tests for stop label sizes and the words shown for a missing date.
 * They confirm a missing date is worded in each language and a known date is shown as it is.
 * They also confirm every language's missing-date words fit the English width the layout reserves, so rides lay out alike.
 */
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { UNKNOWN_DATE, labelWidth, pillWidth, shownDate } from "./labelWidth";

describe("shownDate", () => {
  it("shows a known date as it is and words a missing one in each language", () => {
    expect(shownDate("2015-03")).toBe("2015-03");
    expect(shownDate(null)).toBe("Date unknown");
    expect(shownDate(null, "tr")).toBe("Tarih yok");
  });

  it.each(LOCALES)("keeps %s's missing-date words within the width the layout reserves", (locale) => {
    expect(shownDate(null, locale).length).toBeLessThanOrEqual(UNKNOWN_DATE.length);
  });
});

describe("labelWidth", () => {
  it("reserves the unknown-date width for a stop without a date", () => {
    expect(labelWidth("A", null)).toBe(pillWidth("A", UNKNOWN_DATE));
  });
});
