/**
 * Tests for the spend guard, run against the in-memory store.
 * They confirm the hourly and daily visitor limits, the shared budget, and settling to the real cost.
 * They also confirm many readings started at once can never push spending past the budget.
 */
import { describe, expect, it } from "vitest";
import { createMemoryLimitStore } from "./memoryLimitStore";
import { reserveSpend, settleSpend } from "./spendGuard";
import { RESERVATION_MICRO_USD, VISITOR_DAILY_LIMIT, VISITOR_HOURLY_LIMIT, limitKeys } from "./usageLimits";

const BUDGET = { dailyBudgetMicroUsd: 1_000_000 };
const NOON = new Date("2026-11-09T12:00:00Z");
const TYPICAL_COST = 15_000;

describe("spend guard", () => {
  it("allows a visitor up to the hourly limit, then refuses", async () => {
    const store = createMemoryLimitStore();
    const keys = limitKeys("visitor", NOON);
    for (let attempt = 0; attempt < VISITOR_HOURLY_LIMIT; attempt += 1) {
      const result = await reserveSpend(store, keys, BUDGET);
      expect(result.ok).toBe(true);
      await settleSpend(store, keys, RESERVATION_MICRO_USD, TYPICAL_COST);
    }
    expect(await reserveSpend(store, keys, BUDGET)).toEqual({ ok: false, reason: "visitor_limit" });
  });

  it("applies the daily visitor limit across hours", async () => {
    const store = createMemoryLimitStore();
    const results = [];
    for (let hour = 0; hour <= VISITOR_DAILY_LIMIT; hour += 1) {
      const keys = limitKeys("visitor", new Date(Date.UTC(2026, 10, 9, hour)));
      const result = await reserveSpend(store, keys, BUDGET);
      results.push(result.ok);
      if (result.ok) {
        await settleSpend(store, keys, result.reservedMicroUsd, TYPICAL_COST);
      }
    }
    expect(results.filter(Boolean)).toHaveLength(VISITOR_DAILY_LIMIT);
    expect(results.at(-1)).toBe(false);
  });

  it("keeps visitors apart", async () => {
    const store = createMemoryLimitStore();
    const roomy = { dailyBudgetMicroUsd: RESERVATION_MICRO_USD * (VISITOR_HOURLY_LIMIT + 2) };
    for (let attempt = 0; attempt <= VISITOR_HOURLY_LIMIT; attempt += 1) {
      await reserveSpend(store, limitKeys("busy", NOON), roomy);
    }
    expect((await reserveSpend(store, limitKeys("calm", NOON), roomy)).ok).toBe(true);
  });

  it("refuses once the shared budget is spent, and gives the reservation back", async () => {
    const store = createMemoryLimitStore();
    const tiny = { dailyBudgetMicroUsd: RESERVATION_MICRO_USD + TYPICAL_COST };
    const first = limitKeys("first", NOON);
    expect((await reserveSpend(store, first, tiny)).ok).toBe(true);
    await settleSpend(store, first, RESERVATION_MICRO_USD, RESERVATION_MICRO_USD);
    expect(await reserveSpend(store, limitKeys("second", NOON), tiny)).toEqual({ ok: false, reason: "daily_limit" });
    expect(await store.increment(first.budgetDay, 0, 1)).toBe(RESERVATION_MICRO_USD);
  });

  it("settles to the real cost, so cheap readings leave room for more", async () => {
    const store = createMemoryLimitStore();
    const keys = limitKeys("visitor", NOON);
    await reserveSpend(store, keys, BUDGET);
    await settleSpend(store, keys, RESERVATION_MICRO_USD, TYPICAL_COST);
    expect(await store.increment(keys.budgetDay, 0, 1)).toBe(TYPICAL_COST);
  });

  it("never lets readings started at once go past the budget", async () => {
    const store = createMemoryLimitStore();
    const results = await Promise.all(
      Array.from({ length: 40 }, (_, index) => reserveSpend(store, limitKeys(`v${index}`, NOON), BUDGET)),
    );
    const allowed = results.filter((result) => result.ok).length;
    expect(allowed).toBe(Math.floor(BUDGET.dailyBudgetMicroUsd / RESERVATION_MICRO_USD));
    expect(await store.increment(limitKeys("any", NOON).budgetDay, 0, 1)).toBeLessThanOrEqual(BUDGET.dailyBudgetMicroUsd);
  });

  it("allows nothing with a zero budget", async () => {
    const store = createMemoryLimitStore();
    expect(await reserveSpend(store, limitKeys("v", NOON), { dailyBudgetMicroUsd: 0 })).toEqual({ ok: false, reason: "daily_limit" });
  });
});
