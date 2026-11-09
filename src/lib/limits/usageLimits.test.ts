/**
 * Tests for the public-use limit rules.
 * They confirm prices and costs in micro-dollars, the window keys, and reading the budget setting.
 * They also confirm unknown models are charged at the highest price and keys never hold an address.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAILY_BUDGET_MICRO_USD,
  RESERVATION_MICRO_USD,
  costMicroUsd,
  limitKeys,
  parseDailyBudget,
  pricesFor,
} from "./usageLimits";

/** A 20,000-character story at one token per character, plus the system prompt. */
const STORY_SIZED_INPUT = 22_500;
const MAX_OUTPUT = 12_000;

describe("usage limits", () => {
  it("prices a typical Sonnet reading at about 1.5 cents", () => {
    expect(costMicroUsd({ model: "claude-sonnet-5-5", inputTokens: 2_500, outputTokens: 1_000 })).toBe(15_000);
  });

  it("charges unknown models at the highest list price", () => {
    expect(pricesFor("some-future-model")).toEqual({ inputMicroUsdPerToken: 10, outputMicroUsdPerToken: 50 });
    expect(pricesFor("claude-sonnet-5-5-20261101").outputMicroUsdPerToken).toBe(10);
  });

  it("prices each model family by its own name", () => {
    expect(pricesFor("claude-sonnet-5")).toEqual(pricesFor("claude-sonnet-5-5"));
    expect(pricesFor("claude-opus-5-5").outputMicroUsdPerToken).toBe(20);
  });

  it("reserves enough for the worst Sonnet reading", () => {
    const worst = costMicroUsd({ model: "claude-sonnet-5-5", inputTokens: STORY_SIZED_INPUT, outputTokens: MAX_OUTPUT });
    expect(RESERVATION_MICRO_USD).toBeGreaterThanOrEqual(worst);
  });

  it("rounds a cost up to whole micro-dollars", () => {
    expect(costMicroUsd({ model: "claude-haiku-5-5", inputTokens: 1, outputTokens: 1 })).toBe(1);
  });

  it("builds UTC hour, day and budget keys with no address in them", () => {
    const keys = limitKeys("abc123", new Date("2026-11-09T23:59:59Z"));
    expect(keys).toEqual({
      visitorHour: "lrc:visitor:abc123:hour:2026-11-09T23",
      visitorDay: "lrc:visitor:abc123:day:2026-11-09",
      budgetDay: "lrc:budget:2026-11-09",
    });
  });

  it.each([
    [undefined, DEFAULT_DAILY_BUDGET_MICRO_USD],
    ["", DEFAULT_DAILY_BUDGET_MICRO_USD],
    ["abc", DEFAULT_DAILY_BUDGET_MICRO_USD],
    ["-1", DEFAULT_DAILY_BUDGET_MICRO_USD],
    ["3", 3_000_000],
    ["0.3", 300_000],
    ["0", 0],
  ])("reads the budget %s as %i micro-dollars", (value, expected) => {
    expect(parseDailyBudget(value)).toBe(expected);
  });
});
