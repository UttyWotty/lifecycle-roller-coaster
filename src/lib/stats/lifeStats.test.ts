/**
 * Tests for the life statistics.
 * They confirm the numbers match the ride's own levels, and handle empty and tiny lists.
 * They also confirm the year range ignores undated events.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { buildLifeStats, formatYearRange } from "./lifeStats";

function makeEvents(overrides: Partial<LifeEvent>[]): LifeEvent[] {
  return overrides.map((over, index) => ({
    id: `event_${index}`,
    date: null,
    title: `Event ${index}`,
    description: "",
    category: "other",
    sentiment: "positive",
    impact: 5,
    confidence: 1,
    ...over,
  }));
}

describe("buildLifeStats", () => {
  it("returns empty answers for no events", () => {
    expect(buildLifeStats([])).toMatchObject({
      moments: 0,
      biggestClimb: null,
      biggestDrop: null,
      calmestStretch: null,
      topCategory: null,
      firstYear: null,
    });
  });

  it("finds the biggest climb and drop between neighbours", () => {
    const stats = buildLifeStats(
      makeEvents([{ impact: 9 }, { sentiment: "negative", impact: 9 }, { impact: 2 }, { impact: 10 }]),
    );
    expect(stats.biggestDrop).toEqual({ from: "Event 0", to: "Event 1", size: 18 });
    expect(stats.biggestClimb).toEqual({ from: "Event 1", to: "Event 2", size: 11 });
  });

  it("counts big moments and big changes", () => {
    const stats = buildLifeStats(makeEvents([{ impact: 9 }, { impact: 1 }, { impact: 2 }]));
    expect(stats.bigMoments).toBe(1);
    expect(stats.bigChanges).toBe(1);
  });

  it("finds the longest calm stretch", () => {
    const stats = buildLifeStats(
      makeEvents([{ impact: 10 }, { impact: 1 }, { impact: 2 }, { impact: 3 }, { impact: 10 }]),
    );
    expect(stats.calmestStretch).toEqual({ from: "Event 1", to: "Event 3", length: 3 });
  });

  it("uses dated events only for the years", () => {
    const stats = buildLifeStats(makeEvents([{ date: "2010-05" }, {}, { date: "1999" }]));
    expect(stats.firstYear).toBe(1999);
    expect(stats.lastYear).toBe(2010);
  });

  it("names the most common category", () => {
    const stats = buildLifeStats(makeEvents([{ category: "career" }, { category: "health" }, { category: "career" }]));
    expect(stats.topCategory).toBe("career");
  });
});

describe("formatYearRange", () => {
  it("names a single year once", () => {
    expect(formatYearRange(2015, 2015)).toBe("2015");
  });

  it("joins different years", () => {
    expect(formatYearRange(2009, 2023)).toBe("2009 to 2023");
  });

  it("has nothing to say without dates", () => {
    expect(formatYearRange(null, null)).toBeNull();
  });
});

describe("formatYearRange in Turkish", () => {
  it("joins different years with a dash and names a single year once", () => {
    expect(formatYearRange(2009, 2023, "tr")).toBe("2009–2023");
    expect(formatYearRange(2015, 2015, "tr")).toBe("2015");
  });
});
