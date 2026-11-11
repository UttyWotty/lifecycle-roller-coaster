/**
 * Tests for the Constellation world's layout.
 * They confirm stars grow with impact and take their tone from the feeling of each moment.
 * They also confirm lines join stops within a chapter and bridge from one chapter to the next.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { starLinks, starsFor } from "./constellationLayout";

function stop(id: string, x: number, sentiment: TrackStop["sentiment"], impact: number): TrackStop {
  return { id, x, y: x / 10, level: 0, title: id, date: null, category: "career", sentiment, impact, isMajor: false, labelSide: "above" };
}

const STOPS = [stop("a", 100, "positive", 9), stop("b", 200, "negative", 2), stop("c", 300, "neutral", 5), stop("d", 400, "positive", 5)];

describe("starsFor", () => {
  it("grows with impact and takes its tone from the feeling", () => {
    const [big, small, calm] = starsFor(STOPS);
    expect(big.radius).toBeGreaterThan(small.radius);
    expect([big.tone, small.tone, calm.tone]).toEqual(["warm", "cool", "white"]);
    expect(big).toMatchObject({ x: 100, y: 10 });
  });
});

describe("starLinks", () => {
  it("joins every neighbour into one figure when there are no chapters", () => {
    const links = starLinks(STOPS, []);
    expect(links).toHaveLength(3);
    expect(links.every(({ isSameChapter }) => isSameChapter)).toBe(true);
    expect(links[0]).toMatchObject({ from: { x: 100, y: 10 }, to: { x: 200, y: 20 } });
  });

  it("bridges from one chapter to the next, in left-to-right order", () => {
    const chapters = [
      { title: "One", start: 50, end: 250 },
      { title: "Two", start: 260, end: 450 },
    ];
    const links = starLinks([...STOPS].reverse(), chapters);
    expect(links.map(({ isSameChapter }) => isSameChapter)).toEqual([true, false, true]);
  });

  it("treats a stop outside every chapter as a bridge", () => {
    expect(starLinks(STOPS.slice(0, 2), [{ title: "Only", start: 150, end: 250 }])[0].isSameChapter).toBe(false);
  });
});
