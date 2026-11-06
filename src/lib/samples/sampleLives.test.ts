/**
 * Tests for the sample lives and the random picker.
 * They confirm every sample is valid data that fits on a ride.
 * They also confirm the picker reaches every sample and never repeats the current one.
 */
import { describe, expect, it } from "vitest";
import { EVENT_CATEGORIES, lifeEventListSchema } from "@/lib/events/schema";
import { MAJOR_IMPACT, MAX_LABEL_LENGTH } from "@/lib/track/buildTrack";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import { RIDE_STYLES } from "@/lib/track/types";
import { MAX_STORY_LENGTH } from "@/lib/story/storyInput";
import { pickSample } from "./pickSample";
import { SAMPLE_LIVES, sampleStory } from "./sampleLives";

const MIN_EVENTS = 12;
const MIN_MAJOR_EVENTS = 2;
const ALMOST_ONE = 0.999999;

describe("SAMPLE_LIVES", () => {
  it.each(SAMPLE_LIVES.map((life) => [life.id, life] as const))("%s is a full, valid life", (_id, life) => {
    expect(lifeEventListSchema.safeParse({ events: life.events }).success).toBe(true);
    expect(life.events.length).toBeGreaterThanOrEqual(MIN_EVENTS);
    expect(life.events.filter(({ impact }) => impact >= MAJOR_IMPACT).length).toBeGreaterThanOrEqual(MIN_MAJOR_EVENTS);
    expect(life.title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(sampleStory(life).length).toBeLessThanOrEqual(MAX_STORY_LENGTH);
    for (const { title, description } of life.events) {
      expect(title.length).toBeLessThanOrEqual(MAX_LABEL_LENGTH);
      expect(description).not.toBe("");
    }
    expect(RIDE_STYLE_DETAILS[life.rideStyle].build(life.events).stops).toHaveLength(life.events.length);
  });

  it("has unique ids and titles", () => {
    expect(new Set(SAMPLE_LIVES.map(({ id }) => id)).size).toBe(SAMPLE_LIVES.length);
    expect(new Set(SAMPLE_LIVES.map(({ title }) => title)).size).toBe(SAMPLE_LIVES.length);
  });

  it("shows off every category and every ride style", () => {
    const categories = new Set(SAMPLE_LIVES.flatMap(({ events }) => events.map(({ category }) => category)));
    const usedCategories = EVENT_CATEGORIES.filter((category) => category !== "other");
    expect(usedCategories.every((category) => categories.has(category))).toBe(true);
    expect(new Set(SAMPLE_LIVES.map(({ rideStyle }) => rideStyle))).toEqual(new Set(RIDE_STYLES));
  });

  it("includes both hard moments and undated events", () => {
    const events = SAMPLE_LIVES.flatMap((life) => life.events);
    expect(events.some(({ sentiment }) => sentiment === "negative")).toBe(true);
    expect(events.some(({ date }) => date === null)).toBe(true);
  });
});

describe("pickSample", () => {
  it("covers the whole list across the random range", () => {
    const step = 1 / SAMPLE_LIVES.length;
    const picks = SAMPLE_LIVES.map((_, index) => pickSample(null, index * step).id);
    expect(new Set(picks).size).toBe(SAMPLE_LIVES.length);
  });

  it.each([[0], [0.5], [ALMOST_ONE]])("never repeats the current sample at %f", (random) => {
    for (const { id } of SAMPLE_LIVES) {
      expect(pickSample(id, random).id).not.toBe(id);
    }
  });

  it("treats an unknown id as no current sample", () => {
    expect(pickSample("nobody", ALMOST_ONE)).toBeDefined();
  });
});
