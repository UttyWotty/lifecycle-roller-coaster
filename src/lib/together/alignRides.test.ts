/**
 * Tests for lining two to four rides up on one timeline.
 * They confirm the same year shares a column, each ride keeps its own order, and undated events follow their neighbour.
 * They also confirm columns are spaced by time and widened so one ride's labels never overlap, and groups line up too.
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
    expect(mergeColumns([a, b])).toEqual([
      { entries: [0, null], date: "2010" },
      { entries: [null, 0], date: "2012" },
      { entries: [1, 1], date: "2015" },
    ]);
  });

  it("keeps undated events right after their own neighbour and every list in order", () => {
    const a = [event("a1", "2010"), event("a2", null), event("a3", "2020")];
    const b = [event("b1", "2015")];
    const merged = mergeColumns([a, b]);
    expect(merged.map(({ entries }) => entries[0]).filter((index) => index !== null)).toEqual([0, 1, 2]);
    expect(merged[1]).toEqual({ entries: [1, null], date: null });
  });

  it("handles one empty ride", () => {
    expect(mergeColumns([[], [event("b1", "2015")]])).toEqual([{ entries: [null, 0], date: "2015" }]);
  });
});

describe("alignRides", () => {
  const a = [event("a1", "2010"), event("a2", "2015"), event("a3", "2030")];
  const b = [event("b1", "2015"), event("b2", "2016")];
  const aligned = alignRides([a, b], OPTIONS);

  it("puts the same year at the same x in both rides", () => {
    expect(aligned.positions[0][1]).toBe(aligned.positions[1][0]);
    expect(aligned.positions[0]).toHaveLength(a.length);
    expect(aligned.positions[1]).toHaveLength(b.length);
  });

  it("spaces columns further apart for longer gaps", () => {
    const [first, second, third] = aligned.positions[0];
    expect(third - second).toBeGreaterThan(second - first);
    expect(aligned.lastX).toBe(third);
  });

  it("keeps one ride's neighbouring labels apart even in the same year", () => {
    const long = "A long title that fills the label";
    const busy = alignRides([[event("a1", "2015", long), event("a2", "2015-02", long)], []], OPTIONS);
    const [first, second] = busy.positions[0];
    expect(second - first).toBeGreaterThan(labelWidth(long.slice(0, 22), "2015"));
  });

  it("lists the moments both people share", () => {
    expect(sharedMoments(aligned.columns)).toHaveLength(1);
  });
});

describe("groups of three and four", () => {
  const lists = [
    [event("a1", "2010"), event("a2", "2015")],
    [event("b1", "2015"), event("b2", null), event("b3", "2018")],
    [event("c1", "2012"), event("c2", "2015-03")],
    [event("d1", "2018")],
  ];
  const aligned = alignRides(lists, OPTIONS);

  it("shares a column between everyone with a moment in the same year", () => {
    const year2015 = aligned.columns.find(({ date }) => date === "2015");
    expect(year2015?.entries).toEqual([1, 0, 1, null]);
    expect(aligned.positions[0][1]).toBe(aligned.positions[1][0]);
    expect(aligned.positions[2][1]).toBe(aligned.positions[1][0]);
    expect(aligned.positions[3][0]).toBe(aligned.positions[1][2]);
  });

  it("gives every ride all its stops in its own order", () => {
    aligned.positions.forEach((positions, ride) => {
      expect(positions).toHaveLength(lists[ride].length);
      expect([...positions].sort((x, y) => x - y)).toEqual(positions);
    });
  });

  it("counts a moment as shared when at least two people have one", () => {
    expect(sharedMoments(aligned.columns).map(({ date }) => date)).toEqual(["2015", "2018"]);
  });
});
