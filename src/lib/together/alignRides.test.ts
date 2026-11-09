/**
 * Tests for lining two rides up on one timeline.
 * They confirm the same year shares a column, each ride keeps its own order, and undated events follow their neighbour.
 * They also confirm columns are spaced by time and widened so one ride's labels never overlap.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { labelWidth } from "@/lib/track/labelWidth";
import { alignRides, mergeColumns, sharedMoments } from "./alignRides";

const OPTIONS = { firstX: 110, spacing: 170, minShare: 0.6 };

function event(id: string, date: string | null, title = id): LifeEvent {
  return { id, date, title, description: "", category: "other", sentiment: "positive", impact: 5, confidence: 1 };
}

describe("mergeColumns", () => {
  it("shares a column for the same year and orders the rest by date", () => {
    const a = [event("a1", "2010"), event("a2", "2015")];
    const b = [event("b1", "2012"), event("b2", "2015-06")];
    expect(mergeColumns(a, b)).toEqual([
      { a: 0, b: null, date: "2010" },
      { a: null, b: 0, date: "2012" },
      { a: 1, b: 1, date: "2015" },
    ]);
  });

  it("keeps undated events right after their own neighbour and every list in order", () => {
    const a = [event("a1", "2010"), event("a2", null), event("a3", "2020")];
    const b = [event("b1", "2015")];
    const merged = mergeColumns(a, b);
    expect(merged.map(({ a: index }) => index).filter((index) => index !== null)).toEqual([0, 1, 2]);
    expect(merged[1]).toEqual({ a: 1, b: null, date: null });
  });

  it("handles one empty ride", () => {
    expect(mergeColumns([], [event("b1", "2015")])).toEqual([{ a: null, b: 0, date: "2015" }]);
  });
});

describe("alignRides", () => {
  const a = [event("a1", "2010"), event("a2", "2015"), event("a3", "2030")];
  const b = [event("b1", "2015"), event("b2", "2016")];
  const aligned = alignRides(a, b, OPTIONS);

  it("puts the same year at the same x in both rides", () => {
    expect(aligned.positionsA[1]).toBe(aligned.positionsB[0]);
    expect(aligned.positionsA).toHaveLength(a.length);
    expect(aligned.positionsB).toHaveLength(b.length);
  });

  it("spaces columns further apart for longer gaps", () => {
    const [first, second, third] = aligned.positionsA;
    expect(third - second).toBeGreaterThan(second - first);
    expect(aligned.lastX).toBe(third);
  });

  it("keeps one ride's neighbouring labels apart even in the same year", () => {
    const long = "A long title that fills the label";
    const busy = alignRides([event("a1", "2015", long), event("a2", "2015-02", long)], [], OPTIONS);
    const [first, second] = busy.positionsA;
    expect(second - first).toBeGreaterThan(labelWidth(long.slice(0, 22), "2015"));
  });

  it("lists the moments both people share", () => {
    expect(sharedMoments(aligned.columns)).toHaveLength(1);
  });
});
