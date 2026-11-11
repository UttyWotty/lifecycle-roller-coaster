/**
 * Tests for the feedback rules.
 * They confirm a record keeps only the reaction, message, language, day and build, and that bad input is refused.
 * They also confirm the per-visitor and all-visitor limits and the counter keys.
 */
import { describe, expect, it } from "vitest";
import {
  DAILY_FEEDBACK_CAP,
  MAX_MESSAGE_LENGTH,
  VISITOR_DAILY_FEEDBACK,
  VISITOR_HOURLY_FEEDBACK,
  feedbackKeys,
  feedbackRecord,
  isWithinFeedbackLimits,
} from "./feedback";

const NOW = new Date("2026-11-11T09:30:00Z");

describe("feedbackRecord", () => {
  it("keeps only the reaction, trimmed message, language, day and build", () => {
    expect(feedbackRecord({ reaction: "loved", message: "  Great ride!  ", locale: "tr" }, NOW, "abc1234")).toEqual({
      reaction: "loved",
      message: "Great ride!",
      locale: "tr",
      day: "2026-11-11",
      build: "abc1234",
    });
  });

  it("accepts a reaction with no message", () => {
    expect(feedbackRecord({ reaction: "fine", message: "", locale: "en" }, NOW, "b")).toMatchObject({ message: "" });
  });

  it("refuses a missing or unknown reaction, extra fields and other types", () => {
    expect(feedbackRecord({ message: "hi", locale: "en" }, NOW, "b")).toBe("invalid");
    expect(feedbackRecord({ reaction: "angry", message: "", locale: "en" }, NOW, "b")).toBe("invalid");
    expect(feedbackRecord({ reaction: "fine", message: "", locale: "en", story: "secret" }, NOW, "b")).toBe("invalid");
    expect(feedbackRecord({ reaction: "fine", message: "", locale: "xx" }, NOW, "b")).toBe("invalid");
    expect(feedbackRecord("loved", NOW, "b")).toBe("invalid");
  });

  it("refuses a message over the limit, counting whole characters", () => {
    expect(feedbackRecord({ reaction: "fine", message: "a".repeat(MAX_MESSAGE_LENGTH + 1), locale: "en" }, NOW, "b")).toBe("too_long");
    expect(feedbackRecord({ reaction: "fine", message: "ş".repeat(MAX_MESSAGE_LENGTH), locale: "tr" }, NOW, "b")).toMatchObject({ reaction: "fine" });
  });
});

describe("feedback limits", () => {
  it("allows up to each limit and refuses past it", () => {
    const within = { visitorHour: VISITOR_HOURLY_FEEDBACK, visitorDay: VISITOR_DAILY_FEEDBACK, allDay: DAILY_FEEDBACK_CAP };
    expect(isWithinFeedbackLimits(within)).toBe(true);
    expect(isWithinFeedbackLimits({ ...within, visitorHour: VISITOR_HOURLY_FEEDBACK + 1 })).toBe(false);
    expect(isWithinFeedbackLimits({ ...within, visitorDay: VISITOR_DAILY_FEEDBACK + 1 })).toBe(false);
    expect(isWithinFeedbackLimits({ ...within, allDay: DAILY_FEEDBACK_CAP + 1 })).toBe(false);
  });

  it("keys counters by hashed visitor, hour and day", () => {
    expect(feedbackKeys("v1", NOW)).toEqual({
      visitorHour: "lrc:feedback-count:visitor:v1:hour:2026-11-11T09",
      visitorDay: "lrc:feedback-count:visitor:v1:day:2026-11-11",
      allDay: "lrc:feedback-count:all:2026-11-11",
    });
  });
});
