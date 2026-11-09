/**
 * Tests for time-based stop spacing.
 * They confirm that close dates sit closer, long gaps sit further apart, and both ends are clamped.
 * They also confirm undated events, mixed precision and dates out of order keep a sensible gap, and labels keep room.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import {
  MAX_GAP_SHARE,
  MIN_GAP_SHARE,
  NORMAL_GAP_SHARE,
  dateToYears,
  gapShare,
  labelClearances,
  stopPositions,
  yearsBetween,
} from "./stopSpacing";

const SPACING = 100;
const FIRST_X = 50;

function dated(date: string | null, index = 0): LifeEvent {
  return {
    id: `event_${index}`,
    date,
    title: `Event ${index}`,
    description: "",
    category: "other",
    sentiment: "positive",
    impact: 5,
    confidence: 1,
  };
}

function share(from: string | null, to: string | null): number {
  return gapShare(dated(from), dated(to), MIN_GAP_SHARE);
}

describe("dateToYears", () => {
  it("places a year-only date mid-year and a month mid-month", () => {
    expect(dateToYears("2015")).toBe(2015.5);
    expect(dateToYears("2015-01")).toBeCloseTo(2015 + 0.5 / 12);
  });

  it("orders days within a month", () => {
    expect(dateToYears("2015-03-02")).toBeGreaterThan(dateToYears("2015-03-01"));
  });
});

describe("yearsBetween", () => {
  it("compares mixed precision at the shared precision", () => {
    expect(yearsBetween("2015", "2015-03")).toBe(0);
    expect(yearsBetween("2015-03-10", "2015-03")).toBe(0);
    expect(yearsBetween("2014", "2015-01")).toBe(1);
  });
});

describe("gapShare", () => {
  it("gives same-year events the smallest gap", () => {
    expect(share("2015", "2015")).toBe(MIN_GAP_SHARE);
  });

  it("gives events one year apart the normal gap", () => {
    expect(share("2015", "2016")).toBeCloseTo(NORMAL_GAP_SHARE);
  });

  it("grows with time and stops at the widest gap", () => {
    expect(share("2015", "2016")).toBeLessThan(share("2015", "2020"));
    expect(share("2015", "2020")).toBeLessThan(MAX_GAP_SHARE);
    expect(share("1950", "2020")).toBe(MAX_GAP_SHARE);
  });

  it("keeps the normal gap when a date is missing or out of order", () => {
    expect(share(null, "2015")).toBe(NORMAL_GAP_SHARE);
    expect(share("2015", null)).toBe(NORMAL_GAP_SHARE);
    expect(share("2020", "2015")).toBe(NORMAL_GAP_SHARE);
  });

  it("never goes below a style's own minimum", () => {
    expect(gapShare(dated("2015"), dated("2015"), 0.75)).toBe(0.75);
  });
});

describe("stopPositions", () => {
  it("starts at the first position and keeps list order", () => {
    const events = ["2010", "2010", "2011", null, "2030"].map((date, index) => dated(date, index));
    const xs = stopPositions(events, { firstX: FIRST_X, spacing: SPACING, minShare: MIN_GAP_SHARE, clearances: [] });
    expect(xs[0]).toBe(FIRST_X);
    const gaps = xs.slice(1).map((x, index) => x - xs[index]);
    expect(gaps[0]).toBeCloseTo(SPACING * MIN_GAP_SHARE);
    expect(gaps[1]).toBeCloseTo(SPACING * NORMAL_GAP_SHARE);
    expect(gaps[2]).toBeCloseTo(SPACING * NORMAL_GAP_SHARE);
    expect(gaps[3]).toBeCloseTo(SPACING * NORMAL_GAP_SHARE);
    expect(gaps.every((gap) => gap > 0 && Number.isInteger(gap))).toBe(true);
  });

  it("returns nothing for no events", () => {
    expect(stopPositions([], { firstX: FIRST_X, spacing: SPACING, minShare: MIN_GAP_SHARE, clearances: [] })).toEqual([]);
  });
});

describe("labelClearances", () => {
  it("keeps room only between neighbours whose labels share a side", () => {
    const clearances = labelClearances([
      { labelSide: "above", labelWidth: 100 },
      { labelSide: "below", labelWidth: 100 },
      { labelSide: "below", labelWidth: 140 },
    ]);
    expect(clearances[0]).toBe(0);
    expect(clearances[1]).toBe(0);
    expect(clearances[2]).toBeGreaterThan(120);
  });

  it("widens a gap that is too small for the labels", () => {
    const events = [dated("2010", 0), dated("2010", 1)];
    const xs = stopPositions(events, { firstX: 0, spacing: SPACING, minShare: MIN_GAP_SHARE, clearances: [0, 150] });
    expect(xs[1]).toBe(150);
  });
});
