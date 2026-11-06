/**
 * Tests for the scenery generator and for assembling a themed ride.
 * They confirm scenes are stable and fit the canvas, and that Simple adds no scene.
 * They also confirm the balloon and parachute follow the best and hardest moments.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { RIDE_STYLES } from "@/lib/track/types";
import { SKY_HEADROOM, composeRide } from "./composeRide";
import { RIDE_THEMES, RIDE_THEME_DETAILS } from "./themes";

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

const MIXED = makeEvents([
  { impact: 4 },
  { impact: 9 },
  { sentiment: "negative", impact: 10 },
  { sentiment: "negative", impact: 3 },
]);

describe("composeRide", () => {
  it("adds no scene or headroom for the Simple theme", () => {
    const { track, scene } = composeRide(MIXED, { style: "coaster", theme: "plain", title: "" });
    expect(scene).toBeNull();
    expect(track.contentOffset).toBe(0);
  });

  it("keeps sky above the track, and adds the title band on top", () => {
    const plain = composeRide(MIXED, { style: "coaster", theme: "sunny", title: "" }).track;
    const titled = composeRide(MIXED, { style: "coaster", theme: "sunny", title: "Hi" }).track;
    expect(plain.contentOffset).toBe(SKY_HEADROOM);
    expect(titled.contentOffset).toBeGreaterThan(SKY_HEADROOM);
    expect(titled.height - titled.contentOffset).toBe(plain.height - plain.contentOffset);
  });

  it("gives the same scene for the same ride", () => {
    const choices = { style: "loops", theme: "night", title: "Same" } as const;
    expect(composeRide(MIXED, choices)).toEqual(composeRide(MIXED, choices));
  });

  it("draws stars only at night", () => {
    const stars = (theme: "sunny" | "night") =>
      composeRide(MIXED, { style: "coaster", theme, title: "" }).scene?.scenery.stars.length;
    expect(stars("sunny")).toBe(0);
    expect(stars("night")).toBeGreaterThan(0);
  });

  it("gives every sceneless and scenic theme a name and preview", () => {
    for (const theme of RIDE_THEMES) {
      expect(RIDE_THEME_DETAILS[theme].name).not.toBe("");
      expect(RIDE_THEME_DETAILS[theme].swatch).toHaveLength(2);
    }
  });
});

describe("scenery", () => {
  const sizes: [string, Partial<LifeEvent>[]][] = [
    ["no events", []],
    ["one event", [{}]],
    ["many events", Array.from({ length: 60 }, (_, index) => ({ impact: (index % 10) + 1 }))],
  ];
  const cases = RIDE_STYLES.flatMap((style) =>
    sizes.map(([label, overrides]) => [style, label, overrides] as const),
  );

  it.each(cases)("%s scenery fits the canvas for %s", (style, _label, overrides) => {
    const { track, scene } = composeRide(makeEvents(overrides), { style, theme: "night", title: "" });
    const scenery = scene?.scenery;
    expect(scenery).toBeDefined();
    for (const { x, y } of [...(scenery?.clouds ?? []), ...(scenery?.stars ?? [])]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(track.height);
      expect(Number.isFinite(x + y)).toBe(true);
    }
    for (const { x, width, height } of [...(scenery?.skylineFar ?? []), ...(scenery?.skylineNear ?? [])]) {
      expect(x + width).toBeLessThanOrEqual(track.width + 0.001);
      expect(height).toBeLessThan(track.height);
    }
  });

  it("covers the whole width with buildings", () => {
    const { track, scene } = composeRide(MIXED, { style: "coaster", theme: "sunny", title: "" });
    const last = scene?.scenery.skylineFar.at(-1);
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeGreaterThan(track.width * 0.9);
  });

  it("puts the balloon by the best moment and the parachute by the hardest", () => {
    const { track, scene } = composeRide(MIXED, { style: "coaster", theme: "sunny", title: "" });
    expect(scene?.scenery.balloon?.x).toBeGreaterThan(track.stops[1].x);
    expect(scene?.scenery.balloon?.x).toBeLessThan(track.stops[2].x);
    expect(scene?.scenery.parachute?.x).toBeGreaterThan(track.stops[2].x);
    expect(scene?.scenery.parachute?.x).toBeLessThan(track.stops[3].x);
  });

  it("leaves out a parachute when nothing went wrong", () => {
    const { scene } = composeRide(makeEvents([{}, {}]), { style: "coaster", theme: "sunny", title: "" });
    expect(scene?.scenery.parachute).toBeNull();
    expect(scene?.scenery.balloon).not.toBeNull();
  });

  it("keeps the metro map free of ride markers", () => {
    const { scene } = composeRide(MIXED, { style: "metro", theme: "sunny", title: "" });
    expect(scene?.scenery.balloon).toBeNull();
    expect(scene?.scenery.parachute).toBeNull();
  });
});
