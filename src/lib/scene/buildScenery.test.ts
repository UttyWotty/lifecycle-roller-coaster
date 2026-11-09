/**
 * Tests for where the balloon and parachute float on a themed ride.
 * They use crowded rides with long labels, where the old fixed spot landed behind a neighbour's label.
 * They confirm both markers keep clear of every label and of each other.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { boxesOverlap } from "./labelLayout";
import { markerBox, stopLabelBoxes } from "./buildScenery";
import { composeRide } from "./composeRide";

function crowdedLife(count: number): LifeEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `event_${index}`,
    date: "2020",
    title: `A fairly long event title ${index}`,
    description: "",
    category: "other",
    sentiment: index % 3 === 0 ? "negative" : "positive",
    impact: index === 7 || index === 3 ? 10 : 6,
    confidence: 1,
  }));
}

describe("sky markers", () => {
  it.each(["coaster", "loops"] as const)("keep clear of every label on a crowded %s ride", (style) => {
    const { track, scene } = composeRide(crowdedLife(14), { style, theme: "nightmare", title: "Busy" });
    const labels = stopLabelBoxes(track);
    const { balloon, parachute } = scene?.scenery ?? { balloon: null, parachute: null };
    expect(balloon).not.toBeNull();
    expect(parachute).not.toBeNull();
    for (const marker of [balloon, parachute]) {
      const box = markerBox(marker ?? { x: 0, y: 0 });
      expect(labels.filter((label) => boxesOverlap(box, label))).toEqual([]);
    }
    expect(boxesOverlap(markerBox(balloon ?? { x: 0, y: 0 }), markerBox(parachute ?? { x: 0, y: 0 }))).toBe(false);
  });

  it("stay inside the canvas", () => {
    const { track, scene } = composeRide(crowdedLife(14), { style: "coaster", theme: "sunny", title: "" });
    for (const marker of [scene?.scenery.balloon, scene?.scenery.parachute]) {
      expect(marker?.x).toBeGreaterThan(0);
      expect(marker?.x).toBeLessThan(track.width);
      expect((marker?.y ?? 0) + track.contentOffset).toBeGreaterThan(0);
    }
  });
});
