/**
 * Tests for handling one feedback message with in-memory stores.
 * They confirm a good message is kept as a bare record, bad input is refused before any counting, and limits apply.
 * They also confirm a store failure is reported as unavailable and never as success.
 */
import { describe, expect, it } from "vitest";
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import { createMemoryLimitStore } from "@/lib/limits/memoryLimitStore";
import { VISITOR_HOURLY_FEEDBACK } from "./feedback";
import { createMemoryFeedbackStore, unconfiguredFeedbackStore } from "./feedbackStore";
import { submitFeedback, type FeedbackContext } from "./submitFeedback";

const NOW = new Date("2026-11-11T09:30:00Z");
const JSON_TYPE = "application/json";
const GOOD = JSON.stringify({ reaction: "confusing", message: "Where is the poster?", locale: "en" });

function context(overrides: Partial<FeedbackContext> = {}): FeedbackContext & { kept: ReturnType<typeof createMemoryFeedbackStore> } {
  const kept = createMemoryFeedbackStore();
  return { limitStore: createMemoryLimitStore(() => NOW.getTime()), feedbackStore: kept, visitorId: "v1", now: NOW, build: "abc", kept, ...overrides };
}

describe("submitFeedback", () => {
  it("keeps a good message as a bare record and says ok", async () => {
    const ctx = context();
    expect(await submitFeedback(JSON_TYPE, GOOD, ctx)).toEqual({ status: 200, body: { ok: true } });
    expect(ctx.kept.records).toEqual([{ reaction: "confusing", message: "Where is the poster?", locale: "en", day: "2026-11-11", build: "abc" }]);
  });

  it("refuses bad input before counting it against the visitor", async () => {
    const counted: string[] = [];
    const watching: LimitStore = { increment: async (key) => (counted.push(key), 1) };
    const ctx = context({ limitStore: watching });
    expect((await submitFeedback("text/plain", GOOD, ctx)).body).toEqual({ error: "invalid" });
    expect((await submitFeedback(JSON_TYPE, "{not json", ctx)).body).toEqual({ error: "invalid" });
    expect((await submitFeedback(JSON_TYPE, JSON.stringify({ reaction: "fine", message: "x".repeat(1001), locale: "en" }), ctx)).body).toEqual({ error: "too_long" });
    expect(counted).toEqual([]);
    expect(ctx.kept.records).toEqual([]);
  });

  it("refuses a visitor past the hourly limit, and keeps nothing more", async () => {
    const ctx = context();
    for (let sent = 0; sent < VISITOR_HOURLY_FEEDBACK; sent += 1) {
      expect((await submitFeedback(JSON_TYPE, GOOD, ctx)).status).toBe(200);
    }
    expect(await submitFeedback(JSON_TYPE, GOOD, ctx)).toEqual({ status: 429, body: { error: "rate_limited" } });
    expect(ctx.kept.records).toHaveLength(VISITOR_HOURLY_FEEDBACK);
    expect((await submitFeedback(JSON_TYPE, GOOD, { ...ctx, visitorId: "v2" })).status).toBe(200);
  });

  it("reports a broken limit store or feedback store as unavailable", async () => {
    const broken: LimitStore = {
      increment: async () => {
        throw new LimitStoreError("down");
      },
    };
    expect(await submitFeedback(JSON_TYPE, GOOD, context({ limitStore: broken }))).toEqual({ status: 503, body: { error: "unavailable" } });
    expect(await submitFeedback(JSON_TYPE, GOOD, context({ feedbackStore: unconfiguredFeedbackStore }))).toEqual({ status: 503, body: { error: "unavailable" } });
  });
});
