/**
 * Tests for the scenery generator and for assembling a themed ride.
 * They confirm scenes are stable and fit the canvas, and that Simple adds no scene.
 * They also confirm the balloon and parachute follow the best and hardest moments.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { RIDE_STYLES } from "@/lib/track/types";
import { SKY_HEADROOM, composeRide } from "./composeRide";
import { DEFAULT_RIDER } from "./riders";
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

  it("uses the chosen rider, and the default when none is chosen", () => {
    const choices = { style: "coaster", theme: "sunny", title: "" } as const;
    expect(composeRide(MIXED, { ...choices, rider: "robot" }).scene?.rider).toBe("robot");
    expect(composeRide(MIXED, choices).scene?.rider).toBe(DEFAULT_RIDER);
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

  it("gives each kind of theme only its own landmarks", () => {
    const scenery = (theme: "sunny" | "retro" | "haunted") =>
      composeRide(MIXED, { style: "coaster", theme, title: "" }).scene?.scenery;
    expect(scenery("sunny")).toMatchObject({ orb: null, wheels: [], bats: [] });
    expect(scenery("retro")?.wheels.length).toBeGreaterThan(0);
    expect(scenery("retro")?.orb).not.toBeNull();
    expect(scenery("retro")?.skylineFar).toEqual([]);
    expect(scenery("retro")?.bats).toEqual([]);
    expect(scenery("haunted")?.bats.length).toBeGreaterThan(0);
    expect(scenery("haunted")?.orb).not.toBeNull();
    expect(scenery("haunted")?.wheels).toEqual([]);
  });

  it.each(RIDE_STYLES)("keeps new landmarks inside the canvas in %s", (style) => {
    const long = makeEvents(Array.from({ length: 30 }, () => ({})));
    for (const events of [[], MIXED, long]) {
      const retro = composeRide(events, { style, theme: "retro", title: "" });
      for (const { x, y, radius } of retro.scene?.scenery.wheels ?? []) {
        expect(x + radius).toBeLessThanOrEqual(retro.track.width);
        expect(y + radius).toBeLessThanOrEqual(retro.track.height);
        expect(y - radius).toBeGreaterThanOrEqual(0);
      }
      const haunted = composeRide(events, { style, theme: "haunted", title: "" });
      const orb = haunted.scene?.scenery.orb;
      expect(orb?.x).toBeLessThanOrEqual(haunted.track.width);
      expect((orb?.y ?? 0) + (orb?.radius ?? 0)).toBeLessThanOrEqual(haunted.track.height);
      for (const { y } of haunted.scene?.scenery.bats ?? []) {
        expect(y).toBeLessThanOrEqual(haunted.track.height);
      }
    }
  });

  it("adds a floor below the ground only where a mode needs one", () => {
    const sized = (theme: "sunny" | "nightmare") => composeRide(MIXED, { style: "coaster", theme, title: "" }).track;
    expect(sized("sunny").height).toBe(sized("sunny").contentOffset + sized("sunny").groundY);
    expect(sized("nightmare").height).toBeGreaterThan(sized("nightmare").contentOffset + sized("nightmare").groundY);
  });

  it("keeps Minimal Mode free of sky markers", () => {
    const { scene } = composeRide(MIXED, { style: "coaster", theme: "minimal", title: "" });
    expect(scene?.scenery.balloon).toBeNull();
    expect(scene?.scenery.parachute).toBeNull();
  });

  it("uses only black, white and greys in Minimal Mode", () => {
    const palette = RIDE_THEME_DETAILS.minimal.palette ?? {};
    const colors = Object.values(palette).filter((value) => typeof value === "string" && value.startsWith("#"));
    for (const color of colors as string[]) {
      expect(color.slice(1, 3)).toBe(color.slice(3, 5));
      expect(color.slice(3, 5)).toBe(color.slice(5, 7));
    }
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
