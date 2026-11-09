/**
 * Edge-case tests for Ride together found during independent review.
 * They cover undated lists, mixed date precision, rides that never overlap, out-of-order dates and one-event rides.
 * They also confirm composing never throws, keeps every event once, and keeps both drawings the same width.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import type { SharedRide } from "@/lib/share/sharedRide";
import { alignRides } from "./alignRides";
import { composeTogether } from "./composeTogether";

const OPTIONS = { firstX: 110, spacing: 170, minShare: 0.6 };

function event(id: string, date: string | null): LifeEvent {
  return { id, date, title: `Event ${id}`, description: "", category: "other", sentiment: "positive", impact: 5, confidence: 1 };
}

function ride(dates: (string | null)[], prefix: string): SharedRide {
  return { title: "", style: "coaster", theme: "sunny", rider: "smiley", events: dates.map((d, i) => event(`${prefix}${i}`, d)), chapters: [] };
}

const CASES: Record<string, [(string | null)[], (string | null)[]]> = {
  allUndated: [[null, null, null], [null, null]],
  neverOverlap: [["1950", "1960"], ["2010", "2020"]],
  reversedOrder: [["2020", "2010", "2000"], ["2015", "2005"]],
  mixedPrecision: [["2015", "2015-03", "2015-03-04"], ["2015-03-04", "2015", "2015-06"]],
  singleEvents: [["2000"], [null]],
  extremeYears: [["0001", "9999"], ["9999", "0001"]],
};

describe("ride together edge cases", () => {
  it.each(Object.entries(CASES))("%s lines up without losing or repeating an event", (_name, [datesA, datesB]) => {
    const aligned = alignRides(ride(datesA, "a").events, ride(datesB, "b").events, OPTIONS);
    expect(aligned.columns.flatMap((c) => (c.a === null ? [] : [c.a]))).toEqual(datesA.map((_, i) => i));
    expect(aligned.columns.flatMap((c) => (c.b === null ? [] : [c.b]))).toEqual(datesB.map((_, i) => i));
    const xs = aligned.columns.map((c) => c.x);
    expect(xs.every((x, i) => i === 0 || x > xs[i - 1])).toBe(true);
    expect(xs.every(Number.isFinite)).toBe(true);
  });

  it.each(Object.entries(CASES))("%s composes in both styles at one width", (_name, [datesA, datesB]) => {
    for (const style of ["coaster", "loops"] as const) {
      const { rides } = composeTogether([ride(datesA, "a"), ride(datesB, "b")], style, "sunny");
      expect(rides[0].track.width).toBe(rides[1].track.width);
      expect(rides[0].track.stops).toHaveLength(datesA.length);
      expect(rides[1].track.stops).toHaveLength(datesB.length);
    }
  });
});
