/**
 * Tests for the roller-coaster track generator.
 * They confirm how sentiment and impact shape the track, and that geometry fits any list of events.
 * They also confirm the generator is deterministic and works without any AI involvement.
 */
import { describe, expect, it } from "vitest";
import { addBlankEvent } from "@/lib/events/editing";
import { EVENT_CATEGORIES, type LifeEvent } from "@/lib/events/schema";
import {
  MAJOR_IMPACT,
  MAX_LABEL_LENGTH,
  TRACK_HEIGHT,
  buildTrack,
  eventLevels,
  shortenLabel,
} from "./buildTrack";
import { CATEGORY_COLORS } from "./categoryColors";

function makeEvent(index: number, over: Partial<LifeEvent> = {}): LifeEvent {
  return {
    id: `event_${index}`,
    date: "2015",
    title: `Event ${index}`,
    description: "",
    category: "other",
    sentiment: "positive",
    impact: 5,
    confidence: 1,
    ...over,
  };
}

function makeEvents(overrides: readonly Partial<LifeEvent>[]): LifeEvent[] {
  return overrides.map((over, index) => makeEvent(index, over));
}

const PATH_NUMBER = /-?\d+(\.\d+)?/g;

describe("eventLevels", () => {
  it("uses each event's own points, and keeps the last level for neutral", () => {
    const events = makeEvents([
      { sentiment: "positive", impact: 7 },
      { sentiment: "negative", impact: 3 },
      { sentiment: "neutral", impact: 10 },
      { sentiment: "negative", impact: 9 },
    ]);
    expect(eventLevels(events)).toEqual([7, -3, -3, -9]);
  });

  it("is empty for no events", () => {
    expect(eventLevels([])).toEqual([]);
  });
});

/** The steepest part of the rail between the first two stops, as height changed per unit across. */
function steepestSlope(events: LifeEvent[]): number {
  const { profile, stops } = buildTrack(events);
  const between = profile.filter(({ x }) => x >= stops[0].x && x <= stops[1].x);
  const slopes = between.slice(1).map((point, index) => {
    const previous = between[index];
    return Math.abs((point.y - previous.y) / (point.x - previous.x));
  });
  return Math.max(...slopes);
}

describe("buildTrack moves", () => {
  it("drops from a 10 to a 1, even when both felt good", () => {
    const { stops } = buildTrack(makeEvents([{ impact: 10 }, { impact: 1 }]));
    expect(stops[1].y).toBeGreaterThan(stops[0].y);
    expect(stops[1].labelSide).toBe("below");
  });

  it("climbs from a 1 to a 10", () => {
    const { stops } = buildTrack(makeEvents([{ impact: 1 }, { impact: 10 }]));
    expect(stops[1].y).toBeLessThan(stops[0].y);
  });

  it("makes a bigger gap steeper than a smaller one", () => {
    const small = steepestSlope(makeEvents([{ impact: 6 }, { impact: 5 }]));
    const medium = steepestSlope(makeEvents([{ impact: 8 }, { impact: 4 }]));
    const large = steepestSlope(makeEvents([{ impact: 10 }, { impact: 1 }]));
    const hardest = steepestSlope(makeEvents([{ impact: 10 }, { sentiment: "negative", impact: 10 }]));
    expect(medium).toBeGreaterThan(small);
    expect(large).toBeGreaterThan(medium);
    expect(hardest).toBeGreaterThan(large);
  });

  it("uses most of the canvas for the biggest move", () => {
    const { stops } = buildTrack(makeEvents([{ impact: 10 }, { sentiment: "negative", impact: 10 }]));
    expect(stops[1].y - stops[0].y).toBeGreaterThan(TRACK_HEIGHT / 2);
  });

  it("keeps small points looking small", () => {
    const gentle = buildTrack(makeEvents([{ impact: 3 }, { impact: 1 }]));
    const strong = buildTrack(makeEvents([{ impact: 10 }, { impact: 1 }]));
    expect(gentle.stops[1].y - gentle.stops[0].y).toBeLessThan(strong.stops[1].y - strong.stops[0].y);
  });
});

describe("buildTrack shape", () => {
  it("draws a positive event higher on the canvas and a negative one lower", () => {
    const { stops } = buildTrack(
      makeEvents([{ sentiment: "positive" }, { sentiment: "negative", impact: 9 }]),
    );
    expect(stops[0].y).toBeLessThan(stops[1].y);
  });

  it("keeps a neutral event flat even at high impact", () => {
    const { stops } = buildTrack(
      makeEvents([{ sentiment: "positive" }, { sentiment: "neutral", impact: 10 }]),
    );
    expect(stops[1].y).toBe(stops[0].y);
    expect(stops[1].isMajor).toBe(true);
  });

  it("makes a higher-impact rise steeper", () => {
    const gentle = buildTrack(makeEvents([{ impact: 2 }, { sentiment: "negative", impact: 8 }]));
    const steep = buildTrack(makeEvents([{ impact: 8 }, { sentiment: "negative", impact: 8 }]));
    expect(steep.stops[1].y).toBeGreaterThan(gentle.stops[0].y);
    expect(steep.stops[0].level).toBeGreaterThan(gentle.stops[0].level);
  });

  it("spaces stops evenly in list order", () => {
    const { stops } = buildTrack(makeEvents([{}, {}, {}]));
    expect(stops[1].x - stops[0].x).toBe(stops[2].x - stops[1].x);
    expect(stops.map(({ id }) => id)).toEqual(["event_0", "event_1", "event_2"]);
  });

  it("places labels above rises and flats, and below drops", () => {
    const { stops } = buildTrack(
      makeEvents([{ sentiment: "positive" }, { sentiment: "neutral" }, { sentiment: "negative" }]),
    );
    expect(stops.map(({ labelSide }) => labelSide)).toEqual(["above", "above", "below"]);
  });
});

describe("buildTrack bounds", () => {
  const extremes: [string, Partial<LifeEvent>[]][] = [
    ["no events", []],
    ["one event", [{}]],
    ["all neutral", [{ sentiment: "neutral" }, { sentiment: "neutral" }]],
    ["all rising", Array.from({ length: 30 }, () => ({ impact: 10 }))],
    ["all falling", Array.from({ length: 30 }, () => ({ sentiment: "negative" as const, impact: 10 }))],
    ["many mixed", Array.from({ length: 200 }, (_, index) => ({
      sentiment: index % 3 === 0 ? ("negative" as const) : ("positive" as const),
      impact: (index % 10) + 1,
    }))],
  ];

  it.each(extremes)("stays inside the canvas for %s", (_label, overrides) => {
    const track = buildTrack(makeEvents(overrides));
    const numbers = (track.lines[0].path.match(PATH_NUMBER) ?? []).map(Number);
    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers.every(Number.isFinite)).toBe(true);
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0);
    for (const { x, y } of track.stops) {
      expect(x).toBeLessThan(track.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(TRACK_HEIGHT);
    }
  });

  it("gives the same output for the same events", () => {
    const events = makeEvents([{ impact: 3 }, { sentiment: "negative" }]);
    expect(buildTrack(events)).toEqual(buildTrack(events));
  });

  it("handles manually added events", () => {
    const events = addBlankEvent([]).map((event) => ({ ...event, title: "By hand" }));
    expect(buildTrack(events).stops).toHaveLength(1);
  });
});

describe("markers and labels", () => {
  it("marks major events from the threshold upward", () => {
    const { stops } = buildTrack(makeEvents([{ impact: MAJOR_IMPACT - 1 }, { impact: MAJOR_IMPACT }]));
    expect(stops.map(({ isMajor }) => isMajor)).toEqual([false, true]);
  });

  it("gives every category its own colour", () => {
    const colors = EVENT_CATEGORIES.map((category) => CATEGORY_COLORS[category]);
    expect(new Set(colors).size).toBe(EVENT_CATEGORIES.length);
  });

  it("leaves short titles alone", () => {
    expect(shortenLabel("Got married")).toBe("Got married");
    expect(shortenLabel("x".repeat(MAX_LABEL_LENGTH))).toHaveLength(MAX_LABEL_LENGTH);
  });

  it("shortens long titles on the track", () => {
    const label = shortenLabel("x".repeat(MAX_LABEL_LENGTH + 1));
    expect(label).toHaveLength(MAX_LABEL_LENGTH);
    expect(label.endsWith("...")).toBe(true);
  });
});
