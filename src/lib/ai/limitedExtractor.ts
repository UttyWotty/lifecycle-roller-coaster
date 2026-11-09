/**
 * Wraps any extractor with the public-use limits: per-visitor rate limits and the shared daily budget.
 * It reserves budget before the provider is called and settles to the real cost afterwards, even on failure.
 * A failure with no reported usage keeps the reservation as its cost, unless the provider certainly did not bill it.
 * If the limit store cannot be reached, it refuses to call the provider, so money is never spent unchecked.
 */
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import { reserveSpend, settleSpend } from "@/lib/limits/spendGuard";
import { costMicroUsd, limitKeys, type TokenUsage } from "@/lib/limits/usageLimits";
import { ExtractionError, type ExtractionErrorCode } from "./errors";
import type { ExtractionDraft } from "./extraction";
import type { EventExtractor, UsageReporter } from "./extractor";

export interface LimitContext {
  store: LimitStore;
  /** A one-way hash of the visitor's address, never the address itself. */
  visitorId: string;
  dailyBudgetMicroUsd: number;
  now: () => Date;
}

const NO_COST = 0;
/** Failures the provider rejects before generating anything, so nothing is billed: bad key or provider busy. */
const UNBILLED_FAILURES: ReadonlySet<ExtractionErrorCode> = new Set(["not_configured", "rate_limited"]);

/**
 * What a finished reading costs. A reading that reported usage costs exactly that. One that failed without
 * reporting, such as a timeout after the model began, may still be billed, so it keeps its reservation.
 */
function readingCost(usage: TokenUsage | null, failure: unknown, reserved: number): number {
  if (usage !== null) {
    return costMicroUsd(usage);
  }
  if (failure === null || (failure instanceof ExtractionError && UNBILLED_FAILURES.has(failure.code))) {
    return NO_COST;
  }
  return reserved;
}

async function reserveOrRefuse(context: LimitContext, keys: ReturnType<typeof limitKeys>): Promise<number> {
  try {
    const result = await reserveSpend(context.store, keys, { dailyBudgetMicroUsd: context.dailyBudgetMicroUsd });
    if (!result.ok) {
      throw new ExtractionError(result.reason);
    }
    return result.reservedMicroUsd;
  } catch (error) {
    throw error instanceof LimitStoreError ? new ExtractionError("not_configured") : error;
  }
}

export function createLimitedExtractor(inner: EventExtractor, context: LimitContext): EventExtractor {
  return {
    isDemo: inner.isDemo,
    async extract(story: string, signal: AbortSignal, onUsage?: UsageReporter): Promise<ExtractionDraft> {
      const keys = limitKeys(context.visitorId, context.now());
      const reserved = await reserveOrRefuse(context, keys);
      let usage: TokenUsage | null = null;
      let failure: unknown = null;
      try {
        return await inner.extract(story, signal, (reported) => {
          usage = reported;
          onUsage?.(reported);
        });
      } catch (error) {
        failure = error;
        throw error;
      } finally {
        const actual = readingCost(usage, failure, reserved);
        await settleSpend(context.store, keys, reserved, actual).catch(() => undefined);
      }
    },
  };
}
