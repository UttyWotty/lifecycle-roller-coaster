/**
 * Tests for placing life chapters on a ride.
 * They confirm no chapters changes nothing, and that bands follow their stops.
 * They also confirm deleted events shrink or remove a chapter.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { buildTrack } from "./buildTrack";
import { CHAPTER_BAND_HEIGHT, addChapters } from "./rideChapters";

const EVENTS: LifeEvent[] = ["a", "b", "c"].map((id) => ({
  id,
  date: null,
  title: id,
  description: "",
  category: "other",
  sentiment: "positive",
  impact: 5,
  confidence: 1,
}));

describe("addChapters", () => {
  it("returns the same track with no chapters", () => {
    const track = buildTrack(EVENTS);
    expect(addChapters(track, [])).toBe(track);
    expect(addChapters(track, [{ title: "Gone", eventIds: ["zzz"] }])).toBe(track);
  });

  it("adds height and spans the chapter's stops", () => {
    const track = buildTrack(EVENTS);
    const result = addChapters(track, [{ title: "Early", eventIds: ["a", "b"] }]);
    expect(result.height).toBe(track.height + CHAPTER_BAND_HEIGHT);
    expect(result.chapterBands[0].start).toBeLessThan(track.stops[0].x);
    expect(result.chapterBands[0].end).toBeGreaterThan(track.stops[1].x);
    expect(result.chapterBands[0].end).toBeLessThan(track.stops[2].x);
  });

  it("stays inside the canvas", () => {
    const track = buildTrack(EVENTS);
    const [band] = addChapters(track, [{ title: "All", eventIds: ["a", "b", "c"] }]).chapterBands;
    expect(band.start).toBeGreaterThanOrEqual(0);
    expect(band.end).toBeLessThanOrEqual(track.width);
  });
});
