/**
 * Tests for the saved-ride shape and the rules for reading it back.
 * They confirm a ride survives a round trip, and that the story text has no place in it.
 * They also confirm that corrupt, foreign, old or invalid data reads back as no saved ride.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import {
  SAVED_RIDE_VERSION,
  canSaveEvents,
  parseSavedRide,
  serializeRide,
  type SavedRideContent,
} from "./savedRide";

const [sample] = SAMPLE_LIVES;

const CONTENT: SavedRideContent = {
  events: sample.events,
  chapters: sample.chapters,
  report: sample.report,
  clarifications: ["Which city did you move to?"],
  isDemo: false,
  title: "My ride",
  style: "loops",
  theme: "space",
  rider: "cat",
  fitToScreen: true,
};

function withChange(change: Record<string, unknown>): string {
  return JSON.stringify({ ...JSON.parse(serializeRide(CONTENT) ?? ""), ...change });
}

describe("serializeRide and parseSavedRide", () => {
  it("bring back the same ride", () => {
    expect(parseSavedRide(serializeRide(CONTENT))).toEqual({ version: SAVED_RIDE_VERSION, ...CONTENT });
  });

  it("never write a story, even if one is passed in", () => {
    const text = serializeRide({ ...CONTENT, story: "secret story" } as SavedRideContent);
    expect(text).not.toContain("secret story");
    expect(parseSavedRide(text)).not.toHaveProperty("story");
  });

  it("read nothing as no saved ride", () => {
    expect(parseSavedRide(null)).toBeNull();
  });

  it("ignore text that is not JSON", () => {
    expect(parseSavedRide("{not json")).toBeNull();
  });

  it("ignore a save from another version", () => {
    expect(parseSavedRide(withChange({ version: SAVED_RIDE_VERSION + 1 }))).toBeNull();
  });

  it("ignore an unknown style, theme or rider", () => {
    expect(parseSavedRide(withChange({ style: "rocket" }))).toBeNull();
    expect(parseSavedRide(withChange({ theme: "volcano" }))).toBeNull();
    expect(parseSavedRide(withChange({ rider: "dragon" }))).toBeNull();
  });

  it("ignore invalid or empty events", () => {
    expect(parseSavedRide(withChange({ events: [] }))).toBeNull();
    expect(parseSavedRide(withChange({ events: [{ ...sample.events[0], impact: 99 }] }))).toBeNull();
  });
});

describe("serializeRide", () => {
  it("writes nothing for a ride that would not read back", () => {
    expect(serializeRide({ ...CONTENT, events: [] })).toBeNull();
    expect(serializeRide({ ...CONTENT, title: "x".repeat(500) })).toBeNull();
  });
});

describe("canSaveEvents", () => {
  it("accepts complete events", () => {
    expect(canSaveEvents(sample.events)).toBe(true);
  });

  it("refuses no events, a blank title, or duplicate ids", () => {
    expect(canSaveEvents([])).toBe(false);
    expect(canSaveEvents([{ ...sample.events[0], title: "" }])).toBe(false);
    expect(canSaveEvents([sample.events[0], sample.events[0]])).toBe(false);
  });
});
