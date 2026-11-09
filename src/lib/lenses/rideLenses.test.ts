/**
 * Tests for ride lenses.
 * They confirm which lenses are offered for parts of life, decades and ages, and which events each one keeps.
 * They also confirm the fallback to the whole life and the rules for a typed birth year.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { WHOLE_LIFE, activeLens, applyLens, availableLenses, keptLens, parseBirthYear } from "./rideLenses";

function event(index: number, date: string | null, category: LifeEvent["category"]): LifeEvent {
  return {
    id: `event_${index}`,
    date,
    title: `Event ${index}`,
    description: "",
    category,
    sentiment: "positive",
    impact: 5,
    confidence: 1,
  };
}

const LIFE: LifeEvent[] = [
  event(0, "2008", "education"),
  event(1, "2012-05", "career"),
  event(2, "2015", "relationships"),
  event(3, "2019", "career"),
  event(4, null, "other"),
  event(5, "2021-03-02", "career"),
];
const BORN = 1990;

function ids(birthYear: number | null): string[] {
  return availableLenses(LIFE, birthYear).map(({ id }) => id);
}

describe("availableLenses", () => {
  it("offers parts of life and decades with at least two events", () => {
    expect(ids(null)).toEqual(["part:career", "decade:2010"]);
  });

  it("offers age lenses only with a birth year", () => {
    expect(ids(BORN)).toEqual(["part:career", "decade:2010", "age:20", "before:30"]);
  });

  it("never offers a lens that would show the whole life again", () => {
    const careerOnly = [event(0, "2010", "career"), event(1, "2011", "career")];
    expect(availableLenses(careerOnly, null)).toEqual([]);
  });

  it("titles each lens for sharing", () => {
    const titles = availableLenses(LIFE, BORN).map(({ title }) => title);
    expect(titles).toContain("My Career Coaster");
    expect(titles).toContain("My 2010s");
    expect(titles).toContain("My 20s Roller Coaster");
    expect(titles).toContain("My Life Before 30");
  });
});

describe("applyLens", () => {
  const titlesOf = (events: readonly LifeEvent[]): string[] => events.map(({ title }) => title);

  it("keeps the lens's events in their original order", () => {
    expect(titlesOf(applyLens(LIFE, "part:career", null))).toEqual(["Event 1", "Event 3", "Event 5"]);
    expect(titlesOf(applyLens(LIFE, "decade:2010", null))).toEqual(["Event 1", "Event 2", "Event 3"]);
  });

  it("uses age at the event's year and leaves out undated events", () => {
    expect(titlesOf(applyLens(LIFE, "age:20", BORN))).toEqual(["Event 1", "Event 2", "Event 3"]);
    expect(titlesOf(applyLens(LIFE, "before:30", BORN))).toEqual(["Event 0", "Event 1", "Event 2", "Event 3"]);
    expect(applyLens(LIFE, "after:30", BORN)).toBe(LIFE);
  });

  it("falls back to the whole life for the whole-life id, unknown ids and lenses without enough events", () => {
    expect(applyLens(LIFE, WHOLE_LIFE, null)).toBe(LIFE);
    expect(applyLens(LIFE, "part:volcano", null)).toBe(LIFE);
    expect(applyLens(LIFE, "age:20", null)).toBe(LIFE);
    expect(activeLens(LIFE, "part:health", null)).toBeNull();
  });
});

describe("keptLens", () => {
  it("keeps a lens that still has a ride", () => {
    expect(keptLens(LIFE, "part:career", null)).toBe("part:career");
  });

  it("drops a lens that lost its events or its birth year to the whole life", () => {
    expect(keptLens(LIFE.slice(0, 3), "part:career", null)).toBe(WHOLE_LIFE);
    expect(keptLens(LIFE, "age:20", null)).toBe(WHOLE_LIFE);
    expect(keptLens(LIFE, WHOLE_LIFE, BORN)).toBe(WHOLE_LIFE);
  });
});

describe("parseBirthYear", () => {
  it("accepts a plausible four-digit year", () => {
    expect(parseBirthYear(" 1990 ", 2026)).toBe(1990);
  });

  it("refuses blanks, future years, impossible ages and other text", () => {
    for (const text of ["", "2030", "1850", "90", "19x0", "1990.5"]) {
      expect(parseBirthYear(text, 2026)).toBeNull();
    }
  });
});
