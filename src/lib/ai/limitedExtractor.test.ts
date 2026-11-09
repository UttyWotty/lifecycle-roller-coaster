/**
 * Tests for the extractor wrapper that enforces public-use limits, with fake extractors and the memory store.
 * They confirm refused readings never reach the provider, and that real costs are counted even when a reading fails.
 * They also confirm a broken store fails closed instead of letting a reading spend money.
 */
import { describe, expect, it, vi } from "vitest";
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import { createMemoryLimitStore } from "@/lib/limits/memoryLimitStore";
import { RESERVATION_MICRO_USD, VISITOR_HOURLY_LIMIT, limitKeys } from "@/lib/limits/usageLimits";
import { ExtractionError } from "./errors";
import type { ExtractionDraft } from "./extraction";
import type { EventExtractor, UsageReporter } from "./extractor";
import { createLimitedExtractor, type LimitContext } from "./limitedExtractor";

const NOON = new Date("2026-11-09T12:00:00Z");
const DRAFT: ExtractionDraft = { events: [], clarifications: [], chapters: [], report: { headline: "", highlights: [] } };
const USAGE = { model: "claude-sonnet-5-5", inputTokens: 2_500, outputTokens: 1_000 };
const USAGE_COST = 15_000;
const SIGNAL = new AbortController().signal;

type Behaviour = "succeed" | "fail-after-usage" | "fail-before-usage" | "busy";

function fakeProvider(behaviour: Behaviour): EventExtractor & { calls: number } {
  const provider = {
    isDemo: false,
    calls: 0,
    async extract(_story: string, _signal: AbortSignal, onUsage?: UsageReporter): Promise<ExtractionDraft> {
      provider.calls += 1;
      if (behaviour === "fail-before-usage") {
        throw new ExtractionError("provider_failed");
      }
      if (behaviour === "busy") {
        throw new ExtractionError("rate_limited");
      }
      onUsage?.(USAGE);
      if (behaviour === "fail-after-usage") {
        throw new ExtractionError("truncated");
      }
      return DRAFT;
    },
  };
  return provider;
}

function contextWith(store: LimitStore, overrides: Partial<LimitContext> = {}): LimitContext {
  return { store, visitorId: "visitor", dailyBudgetMicroUsd: 1_000_000, now: () => NOON, ...overrides };
}

async function codeOf(run: Promise<unknown>): Promise<string> {
  try {
    await run;
    return "no error";
  } catch (error) {
    return error instanceof ExtractionError ? error.code : "unexpected";
  }
}

async function spent(store: LimitStore): Promise<number> {
  return store.increment(limitKeys("visitor", NOON).budgetDay, 0, 1);
}

describe("createLimitedExtractor", () => {
  it("passes a reading through and counts its real cost", async () => {
    const store = createMemoryLimitStore();
    const provider = fakeProvider("succeed");
    const reported = vi.fn();
    expect(await createLimitedExtractor(provider, contextWith(store)).extract("story", SIGNAL, reported)).toEqual(DRAFT);
    expect(reported).toHaveBeenCalledWith(USAGE);
    expect(await spent(store)).toBe(USAGE_COST);
  });

  it("counts the cost of a reading that failed after the provider answered", async () => {
    const store = createMemoryLimitStore();
    expect(await codeOf(createLimitedExtractor(fakeProvider("fail-after-usage"), contextWith(store)).extract("s", SIGNAL))).toBe("truncated");
    expect(await spent(store)).toBe(USAGE_COST);
  });

  it("keeps the reservation as the cost when a reading failed without reporting usage, since it may be billed", async () => {
    const store = createMemoryLimitStore();
    expect(await codeOf(createLimitedExtractor(fakeProvider("fail-before-usage"), contextWith(store)).extract("s", SIGNAL))).toBe("provider_failed");
    expect(await spent(store)).toBe(RESERVATION_MICRO_USD);
  });

  it("gives the whole reservation back when the provider turned the request away unbilled", async () => {
    const store = createMemoryLimitStore();
    expect(await codeOf(createLimitedExtractor(fakeProvider("busy"), contextWith(store)).extract("s", SIGNAL))).toBe("rate_limited");
    expect(await spent(store)).toBe(0);
  });

  it("refuses a visitor over the limit without calling the provider", async () => {
    const store = createMemoryLimitStore();
    const provider = fakeProvider("succeed");
    const limited = createLimitedExtractor(provider, contextWith(store));
    for (let attempt = 0; attempt < VISITOR_HOURLY_LIMIT; attempt += 1) {
      await limited.extract("s", SIGNAL);
    }
    expect(await codeOf(limited.extract("s", SIGNAL))).toBe("visitor_limit");
    expect(provider.calls).toBe(VISITOR_HOURLY_LIMIT);
  });

  it("refuses once the daily budget is spent, without calling the provider", async () => {
    const provider = fakeProvider("succeed");
    const limited = createLimitedExtractor(provider, contextWith(createMemoryLimitStore(), { dailyBudgetMicroUsd: RESERVATION_MICRO_USD - 1 }));
    expect(await codeOf(limited.extract("s", SIGNAL))).toBe("daily_limit");
    expect(provider.calls).toBe(0);
  });

  it("fails closed when the store cannot be reached", async () => {
    const broken: LimitStore = {
      async increment(): Promise<number> {
        throw new LimitStoreError("down");
      },
    };
    const provider = fakeProvider("succeed");
    expect(await codeOf(createLimitedExtractor(provider, contextWith(broken)).extract("s", SIGNAL))).toBe("not_configured");
    expect(provider.calls).toBe(0);
  });

  it("keeps the demo flag of the extractor it wraps", () => {
    const demo = { ...fakeProvider("succeed"), isDemo: true };
    expect(createLimitedExtractor(demo, contextWith(createMemoryLimitStore())).isDemo).toBe(true);
  });
});
