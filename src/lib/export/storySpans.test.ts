/**
 * Tests for the parts of a drawing the story picture must not cut.
 * They confirm each stop label spans its estimated width around the stop, and each chapter name sits centred in its band.
 * They also confirm Nightmare Mode's signs and the sky markers are covered, and a cut only splits a span from inside.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { composeRide } from "@/lib/scene/composeRide";
import { SIGN_WIDTH, neonSignPositions } from "@/lib/scene/neonSigns";
import type { ChapterBand, Track, TrackStop } from "@/lib/track/types";
import { cutsThrough, keepWholeSpans } from "./storySpans";

const BASE_TRACK = composeRide([], { style: "coaster", theme: "classic", title: "" }).track;

function plainTrack(stops: TrackStop[], chapterBands: ChapterBand[]): Track {
  return { ...BASE_TRACK, stops, chapterBands };
}

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

function stop(x: number, title: string, date: string | null): TrackStop {
  return { id: title, x, y: 0, level: 0, title, date, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

describe("keepWholeSpans", () => {
  it("covers each stop label around its stop", () => {
    const [span] = keepWholeSpans(plainTrack([stop(500, "Ran out of money", "2019")], []), null).words;
    expect(span.from).toBeLessThan(500);
    expect(span.to).toBeGreaterThan(500);
    expect(span.to - span.from).toBeGreaterThan(100);
    expect(span.from + span.to).toBe(1000);
  });

  it("centres a chapter name in its band and keeps it inside the band", () => {
    const [name] = keepWholeSpans(plainTrack([], [{ title: "Rose", start: 100, end: 500 }]), null).words;
    expect(name.from + name.to).toBe(600);
    expect(name.to - name.from).toBe(32);
    const [long] = keepWholeSpans(plainTrack([], [{ title: "A very long chapter name indeed", start: 0, end: 50 }]), null).words;
    expect(long).toEqual({ from: 0, to: 50 });
  });
});

describe("scenery spans", () => {
  it("covers every neon sign in Nightmare Mode", () => {
    const { track, scene } = composeRide(life(6), { style: "coaster", theme: "nightmare", title: "" });
    const spans = keepWholeSpans(track, scene).scenery;
    for (const sign of neonSignPositions(track, scene?.scenery ?? { balloon: null, parachute: null })) {
      expect(spans).toContainEqual({ from: sign.x, to: sign.x + SIGN_WIDTH });
    }
  });

  it("adds nothing for a drawing without a scene", () => {
    const { track } = composeRide(life(6), { style: "coaster", theme: "nightmare", title: "" });
    const spans = keepWholeSpans(track, null);
    expect(spans.scenery).toEqual([]);
    expect(spans.words).toHaveLength(track.stops.length + track.chapterBands.length);
  });
});

describe("cutsThrough", () => {
  it("splits a span only from strictly inside it", () => {
    expect(cutsThrough(15, { from: 10, to: 20 })).toBe(true);
    expect(cutsThrough(10, { from: 10, to: 20 })).toBe(false);
    expect(cutsThrough(25, { from: 10, to: 20 })).toBe(false);
  });
});
