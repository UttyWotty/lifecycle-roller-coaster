/**
 * Tests for the shared event schema.
 * They cover the blueprint example, invalid field values and duplicate ids.
 * They also confirm that sentiment and impact remain independent values.
 */
import { describe, expect, it } from "vitest";
import { lifeEventListSchema, lifeEventSchema, type LifeEvent } from "./schema";

const BLUEPRINT_EVENT: LifeEvent = {
  id: "event_001",
  date: "2015",
  title: "Started University",
  description: "Started a new academic journey.",
  category: "education",
  sentiment: "positive",
  impact: 8,
  confidence: 0.95,
};

describe("lifeEventSchema", () => {
  it("accepts the blueprint example", () => {
    expect(lifeEventSchema.safeParse(BLUEPRINT_EVENT).success).toBe(true);
  });

  it("accepts a neutral event with the highest impact", () => {
    const event = { ...BLUEPRINT_EVENT, sentiment: "neutral", impact: 10 };
    expect(lifeEventSchema.safeParse(event).success).toBe(true);
  });

  it.each(["2015", "2015-06", "2015-06-30", null])("accepts the date %s", (date) => {
    expect(lifeEventSchema.safeParse({ ...BLUEPRINT_EVENT, date }).success).toBe(true);
  });

  it.each(["", "soon", "2015-13", "2015-06-32", "15"])("rejects the date %j", (date) => {
    expect(lifeEventSchema.safeParse({ ...BLUEPRINT_EVENT, date }).success).toBe(false);
  });

  it.each([
    ["an unknown category", { category: "travel" }],
    ["an unknown sentiment", { sentiment: "mixed" }],
    ["an impact below the range", { impact: 0 }],
    ["an impact above the range", { impact: 11 }],
    ["a fractional impact", { impact: 7.5 }],
    ["a confidence below the range", { confidence: -0.1 }],
    ["a confidence above the range", { confidence: 1.1 }],
    ["an empty id", { id: "" }],
    ["an empty title", { title: "" }],
  ])("rejects %s", (_label, override) => {
    expect(lifeEventSchema.safeParse({ ...BLUEPRINT_EVENT, ...override }).success).toBe(false);
  });
});

describe("lifeEventListSchema", () => {
  it("accepts events with unique ids", () => {
    const events = [BLUEPRINT_EVENT, { ...BLUEPRINT_EVENT, id: "event_002" }];
    expect(lifeEventListSchema.safeParse({ events }).success).toBe(true);
  });

  it("accepts an empty list", () => {
    expect(lifeEventListSchema.safeParse({ events: [] }).success).toBe(true);
  });

  it("rejects duplicate ids", () => {
    const result = lifeEventListSchema.safeParse({ events: [BLUEPRINT_EVENT, BLUEPRINT_EVENT] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["events", 1, "id"]);
  });
});
