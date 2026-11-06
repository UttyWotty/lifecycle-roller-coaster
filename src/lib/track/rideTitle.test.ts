/**
 * Tests for placing the user's title on a ride.
 * They confirm an empty title changes nothing and a title makes room at the top.
 * They also confirm long titles fit, even on the shortest possible ride.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { buildTrack } from "./buildTrack";
import { MAX_TITLE_LENGTH, addTitle } from "./rideTitle";

const GLYPH_WIDTH = 0.62;
const INSET = 24;

function makeEvents(count: number): LifeEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `event_${index}`,
    date: null,
    title: `Event ${index}`,
    description: "",
    category: "other",
    sentiment: "positive",
    impact: 5,
    confidence: 1,
  }));
}

describe("addTitle", () => {
  it("returns the same track when the title is empty or only spaces", () => {
    const track = buildTrack(makeEvents(3));
    expect(addTitle(track, "")).toBe(track);
    expect(addTitle(track, "   ")).toBe(track);
  });

  it("trims the title and makes room for it above the ride", () => {
    const track = buildTrack(makeEvents(3));
    const titled = addTitle(track, "  My 20s  ");
    expect(titled.title?.text).toBe("My 20s");
    expect(titled.contentOffset).toBeGreaterThan(0);
    expect(titled.height).toBe(track.height + titled.contentOffset);
    expect(titled.title?.y).toBeLessThan(titled.contentOffset);
  });

  it("keeps a short title at full size without widening the ride", () => {
    const track = buildTrack(makeEvents(5));
    expect(addTitle(track, "My 20s").width).toBe(track.width);
    expect(addTitle(track, "My 20s").title?.fontSize).toBe(30);
  });

  it("shrinks a long title to fit before widening anything", () => {
    const track = buildTrack(makeEvents(5));
    const titled = addTitle(track, "x".repeat(MAX_TITLE_LENGTH));
    expect(titled.width).toBe(track.width);
    expect(titled.title?.fontSize).toBeLessThan(30);
  });

  it.each([[1], [2]])("fits the longest title on a ride of %i stops", (count) => {
    const titled = addTitle(buildTrack(makeEvents(count)), "x".repeat(MAX_TITLE_LENGTH));
    const textWidth = MAX_TITLE_LENGTH * GLYPH_WIDTH * (titled.title?.fontSize ?? 0);
    expect(textWidth + INSET * 2).toBeLessThanOrEqual(titled.width);
  });

  it("allows for full-width scripts", () => {
    const track = buildTrack(makeEvents(1));
    const latin = addTitle(track, "x".repeat(20));
    const wide = addTitle(track, "人".repeat(20));
    expect(wide.width).toBeGreaterThan(latin.width);
  });
});
