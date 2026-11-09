/**
 * Tests for placing planets in the Space world.
 * They confirm no planet covers a stop label or a metro line name, in every ride style.
 * They also confirm only some cloud spots become planets, and that a clear sky keeps them.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { EVENT_CATEGORIES } from "@/lib/events/schema";
import { RIDE_STYLES } from "@/lib/track/types";
import { composeRide } from "./composeRide";
import { boxesOverlap } from "./labelLayout";
import { PLANET_RING_REACH, PLANET_SIZE, placePlanets, rideLabelBoxes } from "./placePlanets";

function busyLife(count: number): LifeEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `event_${index}`,
    date: "2020",
    title: `A long event title number ${index}`,
    description: "",
    category: EVENT_CATEGORIES[index % EVENT_CATEGORIES.length],
    sentiment: index % 2 === 0 ? "positive" : "negative",
    impact: (index % 10) + 1,
    confidence: 1,
  }));
}

describe("placePlanets", () => {
  it.each(RIDE_STYLES)("keeps every planet off the labels in the %s style", (style) => {
    const { track, scene } = composeRide(busyLife(16), { style, theme: "space", title: "Busy" });
    const labels = rideLabelBoxes(track);
    for (const { x, y, scale } of scene?.scenery.planets ?? []) {
      const halfWidth = PLANET_SIZE * PLANET_RING_REACH * scale;
      const halfHeight = PLANET_SIZE * scale;
      const box = { x: x - halfWidth, y: y - halfHeight, width: halfWidth * 2, height: halfHeight * 2 };
      expect(labels.filter((label) => boxesOverlap(box, label))).toEqual([]);
    }
  });

  it("keeps one in three spots when nothing is in the way", () => {
    const { track } = composeRide([], { style: "coaster", theme: "space", title: "" });
    const spots = Array.from({ length: 9 }, (_, index) => ({ x: index * 400, y: 60, scale: 1 }));
    expect(placePlanets(track, spots)).toEqual([spots[0], spots[3], spots[6]]);
  });

  it("names metro lines in the label boxes", () => {
    const { track } = composeRide(busyLife(6), { style: "metro", theme: "space", title: "" });
    const categoryLines = track.lines.filter(({ category }) => category !== null).length;
    expect(rideLabelBoxes(track)).toHaveLength(track.stops.length + categoryLines);
  });

  it("draws planets only in the Space world", () => {
    const { scene } = composeRide(busyLife(6), { style: "coaster", theme: "sunny", title: "" });
    expect(scene?.scenery.planets).toEqual([]);
  });
});
