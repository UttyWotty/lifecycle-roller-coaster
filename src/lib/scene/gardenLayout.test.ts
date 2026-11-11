/**
 * Tests for the Garden world's layout.
 * They confirm leaves sit on the stem at a steady spacing, alternate sides and keep clear of stops.
 * They also confirm seasons follow chapters in order across the whole width, and blooms follow each stop's feeling.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { DEFAULT_SEASON, LEAF_SPACING, bloomsFor, leafSpots, seasonBands } from "./gardenLayout";

const FLAT_RISE = [
  { x: 0, y: 200 },
  { x: 400, y: 200 },
  { x: 800, y: 0 },
];

function stop(id: string, x: number, sentiment: TrackStop["sentiment"], impact: number): TrackStop {
  return { id, x, y: 100, level: 0, title: id, date: null, category: "career", sentiment, impact, isMajor: false, labelSide: "above" };
}

describe("leafSpots", () => {
  it("places leaves on the stem, alternating sides, turned to the slope", () => {
    const spots = leafSpots(FLAT_RISE, []);
    expect(spots[1].x - spots[0].x).toBe(LEAF_SPACING);
    expect(spots[0]).toMatchObject({ y: 200, angle: 0, side: "up" });
    expect(spots[1].side).toBe("down");
    const rising = spots.find((spot) => spot.x > 400);
    expect(rising?.angle).toBeCloseTo(-26.57, 1);
    expect(rising?.y).toBeLessThan(200);
  });

  it("keeps leaves away from stops and returns none without a stem", () => {
    const spots = leafSpots(FLAT_RISE, [{ x: 35 }]);
    expect(spots.every(({ x }) => Math.abs(x - 35) >= 40)).toBe(true);
    expect(leafSpots([], [])).toEqual([]);
  });
});

describe("seasonBands", () => {
  it("is all summer without chapters", () => {
    expect(seasonBands([], 900)).toEqual([{ from: 0, to: 900, season: DEFAULT_SEASON }]);
  });

  it("gives chapters the seasons in order, stretched to cover the whole width", () => {
    const bands = seasonBands(
      [
        { title: "B", start: 420, end: 700 },
        { title: "A", start: 80, end: 400 },
        { title: "C", start: 720, end: 900 },
        { title: "D", start: 920, end: 1000 },
        { title: "E", start: 1020, end: 1100 },
      ],
      1200,
    );
    expect(bands.map(({ season }) => season)).toEqual(["spring", "summer", "autumn", "winter", "spring"]);
    expect(bands[0].from).toBe(0);
    expect(bands.at(-1)?.to).toBe(1200);
    bands.slice(1).forEach((band, index) => expect(band.from).toBe(bands[index].to));
  });
});

describe("bloomsFor", () => {
  it("blooms by feeling and grows with impact", () => {
    const [good, hard, calm] = bloomsFor([stop("g", 10, "positive", 9), stop("h", 20, "negative", 2), stop("c", 30, "neutral", 5)]);
    expect([good.shape, hard.shape, calm.shape]).toEqual(["flower", "thorns", "sprout"]);
    expect(good.radius).toBeGreaterThan(hard.radius);
  });
});
