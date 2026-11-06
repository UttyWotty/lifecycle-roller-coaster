/**
 * Tests for the loop track, the metro map and the ride style registry.
 * They confirm where loops and interchanges appear, and that every style fits any list of events.
 * They also confirm each style keeps the user's events and stays deterministic.
 */
import { describe, expect, it } from "vitest";
import type { EventCategory, LifeEvent } from "@/lib/events/schema";
import { MAJOR_IMPACT, buildLoopTrack, loopRadius } from "./buildTrack";
import { buildMetroMap } from "./buildMetroMap";
import { RIDE_STYLE_DETAILS } from "./rideStyles";
import { RIDE_STYLES } from "./types";

const PATH_NUMBER = /-?\d+(?:\.\d+)?/g;
const ALL_CATEGORIES: EventCategory[] = [
  "education",
  "career",
  "relationships",
  "finance",
  "business",
  "personal",
  "health",
  "other",
];

function makeEvents(overrides: Partial<LifeEvent>[]): LifeEvent[] {
  return overrides.map((over, index) => ({
    id: `event_${index}`,
    date: "2015",
    title: `Event ${index}`,
    description: "",
    category: "other",
    sentiment: "positive",
    impact: 5,
    confidence: 1,
    ...over,
  }));
}

function pointsOf(path: string): { x: number; y: number }[] {
  const numbers = (path.match(PATH_NUMBER) ?? []).map(Number);
  return numbers.flatMap((value, index) =>
    index % 2 === 0 ? [{ x: value, y: numbers[index + 1] }] : [],
  );
}

describe("buildLoopTrack", () => {
  it("adds one full circle for each major event and none for the rest", () => {
    const events = makeEvents([{ impact: MAJOR_IMPACT - 1 }, { impact: MAJOR_IMPACT }, { impact: 10 }]);
    const path = buildLoopTrack(events).lines[0].path;
    const curves = path.split("C").length - 1;
    const stopsAndEnds = events.length + 1;
    expect(curves).toBe(stopsAndEnds + 2 * 2);
  });

  it("returns to the same point after each loop, so the rail stays joined", () => {
    const [stop] = buildLoopTrack(makeEvents([{ impact: 10 }])).stops;
    const path = buildLoopTrack(makeEvents([{ impact: 10 }])).lines[0].path;
    const top = stop.y - loopRadius(10) * 2;
    expect(path).toContain(`${stop.x} ${top}`);
    expect(path.split(`${stop.x} ${stop.y}`).length).toBeGreaterThanOrEqual(3);
  });

  it("makes bigger events into bigger loops", () => {
    expect(loopRadius(10)).toBeGreaterThan(loopRadius(MAJOR_IMPACT));
  });

  it("keeps the tallest loop inside the canvas at the highest stop", () => {
    const track = buildLoopTrack(makeEvents([{ impact: 10 }, { impact: 10 }, { impact: 10 }]));
    expect(Math.min(...pointsOf(track.lines[0].path).map(({ y }) => y))).toBeGreaterThan(0);
  });

  it("puts labels of looped stops below, clear of the loop", () => {
    const { stops } = buildLoopTrack(makeEvents([{ impact: 2 }, { impact: MAJOR_IMPACT }]));
    expect(stops.map(({ labelSide }) => labelSide)).toEqual(["above", "below"]);
  });
});

describe("buildMetroMap", () => {
  const mixed = makeEvents([
    { category: "education" },
    { category: "career", sentiment: "negative", impact: 9 },
    { category: "education", sentiment: "neutral" },
    { category: "health" },
  ]);

  it("draws one named line for each category used, in order of first use", () => {
    const { lines } = buildMetroMap(mixed);
    expect(lines.map(({ category }) => category)).toEqual(["education", "career", "health"]);
  });

  it("runs every line the full width of the map", () => {
    const { lines, stops } = buildMetroMap(mixed);
    const ends = lines.map(({ path }) => pointsOf(path).at(-1)?.x);
    expect(new Set(ends).size).toBe(1);
    expect(ends[0]).toBeGreaterThan(stops.at(-1)?.x ?? 0);
  });

  it("brings every line through a major stop, side by side", () => {
    const { lines, stops } = buildMetroMap(mixed);
    const major = stops[1];
    const passes = lines.map(({ path }) =>
      pointsOf(path).find(({ x }) => x === major.x)?.y ?? Number.NaN,
    );
    expect(new Set(passes).size).toBe(lines.length);
    for (const y of passes) {
      expect(Math.abs(y - major.y)).toBeLessThanOrEqual(15);
    }
  });

  it("leaves minor stops on their own line only", () => {
    const { lines, stops } = buildMetroMap(mixed);
    const minor = stops[3];
    const healthLine = lines.find(({ category }) => category === "health");
    const careerLine = lines.find(({ category }) => category === "career");
    expect(healthLine?.path).toContain(`${minor.x} ${minor.y}`);
    expect(careerLine?.path).not.toContain(`${minor.x} ${minor.y}`);
  });

  it("spreads lines back to their own lane between distant big moments", () => {
    const { lines, stops } = buildMetroMap(
      makeEvents([
        { category: "career", impact: 10 },
        { category: "health" },
        { category: "other" },
        { category: "career", impact: 10 },
      ]),
    );
    const otherLine = lines.find(({ category }) => category === "other");
    const laneY = otherLine?.start.y;
    const onLane = pointsOf(otherLine?.path ?? "").filter(({ y }) => y === laneY);
    expect(onLane.some(({ x }) => x > stops[0].x && x < stops[2].x)).toBe(true);
  });

  it("moves a stop when its sentiment or impact changes", () => {
    const base = makeEvents([{ sentiment: "neutral" }]);
    const y = buildMetroMap(base).stops[0].y;
    expect(buildMetroMap(makeEvents([{ impact: 5 }])).stops[0].y).toBeLessThan(y);
    expect(buildMetroMap(makeEvents([{ sentiment: "negative" }])).stops[0].y).toBeGreaterThan(y);
  });

  it("keeps a bundle of every category inside a major marker", () => {
    const events = makeEvents(
      ALL_CATEGORIES.map((category, index) => ({ category, impact: index === 4 ? 10 : 5 })),
    );
    const { lines, stops } = buildMetroMap(events);
    const major = stops[4];
    const offsets = lines.map(({ path }) =>
      Math.abs((pointsOf(path).find(({ x }) => x === major.x)?.y ?? Number.NaN) - major.y),
    );
    expect(Math.max(...offsets)).toBeLessThanOrEqual(15);
  });
});

describe("every ride style", () => {
  const extremes: [string, Partial<LifeEvent>[]][] = [
    ["no events", []],
    ["one event", [{}]],
    ["one major event", [{ impact: 10, sentiment: "negative" }]],
    ["all neutral", [{ sentiment: "neutral" }, { sentiment: "neutral", impact: 10 }]],
    ["all rising", Array.from({ length: 30 }, () => ({ impact: 10 }))],
    ["all falling", Array.from({ length: 30 }, () => ({ sentiment: "negative" as const, impact: 10 }))],
    ["every category", ALL_CATEGORIES.map((category) => ({ category, impact: 10, sentiment: "negative" as const }))],
  ];
  const cases = RIDE_STYLES.flatMap((style) =>
    extremes.map(([label, overrides]) => [style, label, overrides] as const),
  );

  it.each(cases)("%s stays inside the canvas for %s", (style, _label, overrides) => {
    const track = RIDE_STYLE_DETAILS[style].build(makeEvents(overrides));
    expect(track.style).toBe(style);
    for (const { x, y } of [...track.stops, ...track.lines.flatMap(({ path }) => pointsOf(path))]) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(track.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(track.height);
    }
  });

  it.each(RIDE_STYLES)("%s keeps every event, in order, and is deterministic", (style) => {
    const events = makeEvents([{ impact: 9 }, { sentiment: "negative" }, { category: "career" }]);
    const { build } = RIDE_STYLE_DETAILS[style];
    expect(build(events).stops.map(({ id }) => id)).toEqual(["event_0", "event_1", "event_2"]);
    expect(build(events)).toEqual(build(events));
  });
});
