/**
 * Tests for where Nightmare Mode hangs its neon signs.
 * They confirm each sign is centred halfway between two stops, and that metro maps get none.
 * They also confirm a sign is left out next to the balloon or parachute.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { composeRide } from "./composeRide";
import { SIGN_WIDTH, neonSignPositions } from "./neonSigns";

function life(count: number): LifeEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `event_${index}`,
    date: String(2000 + index),
    title: `Event ${index}`,
    description: "",
    category: "career",
    sentiment: index % 2 === 0 ? "positive" : "negative",
    impact: 5,
    confidence: 1,
  }));
}

const NO_MARKERS = { balloon: null, parachute: null };

describe("neonSignPositions", () => {
  it("centres one sign halfway between each pair of stops", () => {
    const { track } = composeRide(life(5), { style: "coaster", theme: "nightmare", title: "" });
    const signs = neonSignPositions(track, NO_MARKERS);
    expect(signs).toHaveLength(4);
    signs.forEach((sign, index) => {
      expect(sign.x + SIGN_WIDTH / 2).toBeCloseTo((track.stops[index].x + track.stops[index + 1].x) / 2);
    });
  });

  it("hangs no signs on a metro map", () => {
    const { track } = composeRide(life(5), { style: "metro", theme: "nightmare", title: "" });
    expect(neonSignPositions(track, NO_MARKERS)).toEqual([]);
  });

  it("leaves a sign out next to the balloon", () => {
    const { track } = composeRide(life(5), { style: "coaster", theme: "nightmare", title: "" });
    const middle = (track.stops[0].x + track.stops[1].x) / 2;
    const signs = neonSignPositions(track, { balloon: { x: middle, y: 0 }, parachute: null });
    expect(signs).toHaveLength(3);
  });
});
