/**
 * Adversarial tests for the limited extractor: many readings started at once, flaky stores, and aborted calls.
 * They confirm the provider is never called without a held reservation and the daily budget stays bounded.
 * They use fake providers and the memory store, so no network or tokens are involved.
 */
import { describe, expect, it } from "vitest";
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import { createMemoryLimitStore } from "@/lib/limits/memoryLimitStore";
import { RESERVATION_MICRO_USD, limitKeys } from "@/lib/limits/usageLimits";
import { ExtractionError } from "./errors";
import type { ExtractionDraft } from "./extraction";
import type { EventExtractor, UsageReporter } from "./extractor";
import { createLimitedExtractor } from "./limitedExtractor";

const NOON = new Date("2026-11-09T12:00:00Z");
const DRAFT: ExtractionDraft = { events: [], clarifications: [], chapters: [], report: { headline: "", highlights: [] } };
const SIGNAL = new AbortController().signal;
const BUDGET_SLOTS = 3;
const VISITORS = 40;

function slowProvider(cost: { inputTokens: number; outputTokens: number }): EventExtractor & { calls: number } {
  const provider = {
    isDemo: false,
    calls: 0,
    async extract(_s: string, _g: AbortSignal, onUsage?: UsageReporter): Promise<ExtractionDraft> {
      provider.calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      onUsage?.({ model: "claude-sonnet-5-5", ...cost });
      return DRAFT;
    },
  };
  return provider;
}

async function outcome(run: Promise<unknown>): Promise<string> {
  try {
    await run;
    return "ok";
  } catch (error) {
    return error instanceof ExtractionError ? error.code : "unexpected";
  }
}

describe("createLimitedExtractor under pressure", () => {
  it("lets only as many parallel readings reach the provider as the budget can hold", async () => {
    const store = createMemoryLimitStore();
    const provider = slowProvider({ inputTokens: 1, outputTokens: 1 });
    const budget = RESERVATION_MICRO_USD * BUDGET_SLOTS;
    const results = await Promise.all(
      Array.from({ length: VISITORS }, (_, index) =>
        outcome(
          createLimitedExtractor(provider, { store, visitorId: `v${index}`, dailyBudgetMicroUsd: budget, now: () => NOON }).extract("s", SIGNAL),
        ),
      ),
    );
    expect(provider.calls).toBe(BUDGET_SLOTS);
    expect(results.filter((code) => code === "ok")).toHaveLength(BUDGET_SLOTS);
    expect(results.filter((code) => code === "daily_limit")).toHaveLength(VISITORS - BUDGET_SLOTS);
  });

  it("does not call the provider when the rollback or hour counter store call throws a plain error", async () => {
    const broken: LimitStore = {
      async increment(): Promise<number> {
        throw new TypeError("boom");
      },
    };
    const provider = slowProvider({ inputTokens: 1, outputTokens: 1 });
    const code = await outcome(createLimitedExtractor(provider, { store: broken, visitorId: "v", dailyBudgetMicroUsd: 1_000_000, now: () => NOON }).extract("s", SIGNAL));
    expect(code).not.toBe("ok");
    expect(provider.calls).toBe(0);
  });

  it("fails closed when only the budget counter call fails", async () => {
    const inner = createMemoryLimitStore();
    const store: LimitStore = {
      async increment(key: string, amount: number, ttl: number): Promise<number> {
        if (key.includes(":budget:")) {
          throw new LimitStoreError("budget down");
        }
        return inner.increment(key, amount, ttl);
      },
    };
    const provider = slowProvider({ inputTokens: 1, outputTokens: 1 });
    const code = await outcome(createLimitedExtractor(provider, { store, visitorId: "v", dailyBudgetMicroUsd: 1_000_000, now: () => NOON }).extract("s", SIGNAL));
    expect(code).toBe("not_configured");
    expect(provider.calls).toBe(0);
  });

  it("returns the draft even when settling fails afterwards, leaving the reservation held", async () => {
    const inner = createMemoryLimitStore();
    let budgetCalls = 0;
    const store: LimitStore = {
      async increment(key: string, amount: number, ttl: number): Promise<number> {
        if (key.includes(":budget:") && (budgetCalls += 1) > 1) {
          throw new LimitStoreError("settle down");
        }
        return inner.increment(key, amount, ttl);
      },
    };
    const provider = slowProvider({ inputTokens: 1, outputTokens: 1 });
    const limited = createLimitedExtractor(provider, { store, visitorId: "v", dailyBudgetMicroUsd: 1_000_000, now: () => NOON });
    expect(await outcome(limited.extract("s", SIGNAL))).toBe("ok");
    expect(await inner.increment(limitKeys("v", NOON).budgetDay, 0, 1)).toBe(RESERVATION_MICRO_USD);
  });

  it("starts a fresh budget on the next UTC day", async () => {
    const store = createMemoryLimitStore();
    const provider = slowProvider({ inputTokens: 1, outputTokens: 1 });
    let now = NOON;
    const limited = createLimitedExtractor(provider, { store, visitorId: "v", dailyBudgetMicroUsd: RESERVATION_MICRO_USD, now: () => now });
    expect(await outcome(limited.extract("s", SIGNAL))).toBe("ok");
    expect(await outcome(limited.extract("s", SIGNAL))).toBe("daily_limit");
    now = new Date("2026-11-10T00:00:01Z");
    expect(await outcome(limited.extract("s", SIGNAL))).toBe("ok");
  });
});
