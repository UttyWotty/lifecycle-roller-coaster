/**
 * Pure rules for how much a public visitor may use the AI reading, and what each reading costs.
 * It holds the per-visitor limits, model prices in micro-dollars per token, and the time-window keys.
 * Nothing here performs I/O; the store and the clock are supplied by callers.
 */

/** Real readings one visitor may start per clock hour and per UTC day. */
export const VISITOR_HOURLY_LIMIT = 5;
export const VISITOR_DAILY_LIMIT = 12;
/** Spend allowed across all visitors per UTC day, in micro-dollars (one millionth of a dollar). */
export const DEFAULT_DAILY_BUDGET_MICRO_USD = 1_000_000;
export const MICRO_USD_PER_USD = 1_000_000;
/**
 * Held against the budget before each reading and settled to the real cost after.
 * It covers the worst case for the default model, Claude Sonnet 5.5: a 20,000-character story in a token-dense
 * script such as Chinese (up to about one token per character) plus the system prompt, about 22,500 input
 * tokens, and the full 12,000 output tokens. Settling always charges the real price of the model that answered.
 */
export const RESERVATION_MICRO_USD = 170_000;

export interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface TokenPrices {
  inputMicroUsdPerToken: number;
  outputMicroUsdPerToken: number;
}

/** Prices per million tokens equal micro-dollars per token, so $2 per million input tokens is 2 here. */
const MODEL_PRICES: ReadonlyArray<readonly [prefix: string, prices: TokenPrices]> = [
  ["claude-sonnet-5-5", { inputMicroUsdPerToken: 2, outputMicroUsdPerToken: 10 }],
  ["claude-sonnet-5", { inputMicroUsdPerToken: 2, outputMicroUsdPerToken: 10 }],
  ["claude-opus-5-5", { inputMicroUsdPerToken: 4, outputMicroUsdPerToken: 20 }],
  ["claude-haiku-5-5", { inputMicroUsdPerToken: 0.1, outputMicroUsdPerToken: 0.5 }],
];
/** Unknown models are charged at the highest current list price, so a model change can never overspend. */
const UNKNOWN_MODEL_PRICES: TokenPrices = { inputMicroUsdPerToken: 10, outputMicroUsdPerToken: 50 };

export function pricesFor(model: string): TokenPrices {
  return MODEL_PRICES.find(([prefix]) => model === prefix || model.startsWith(`${prefix}-`))?.[1] ?? UNKNOWN_MODEL_PRICES;
}

/** The cost of one reading in whole micro-dollars, rounded up. */
export function costMicroUsd(usage: TokenUsage): number {
  const { inputMicroUsdPerToken, outputMicroUsdPerToken } = pricesFor(usage.model);
  return Math.ceil(usage.inputTokens * inputMicroUsdPerToken + usage.outputTokens * outputMicroUsdPerToken);
}

export interface LimitKeys {
  visitorHour: string;
  visitorDay: string;
  budgetDay: string;
}

const KEY_PREFIX = "lrc";
const DAY_LENGTH = 10;
const HOUR_LENGTH = 13;
/** Counters outlive their window a little, so a counter never vanishes while its window is still open. */
export const HOUR_KEY_TTL_SECONDS = 2 * 60 * 60;
export const DAY_KEY_TTL_SECONDS = 2 * 24 * 60 * 60;

/** Keys for the current UTC hour and day. The visitor id is already a one-way hash, never a raw address. */
export function limitKeys(visitorId: string, now: Date): LimitKeys {
  const stamp = now.toISOString();
  const day = stamp.slice(0, DAY_LENGTH);
  const hour = stamp.slice(0, HOUR_LENGTH);
  return {
    visitorHour: `${KEY_PREFIX}:visitor:${visitorId}:hour:${hour}`,
    visitorDay: `${KEY_PREFIX}:visitor:${visitorId}:day:${day}`,
    budgetDay: `${KEY_PREFIX}:budget:${day}`,
  };
}

/** Reads a budget in dollars, falling back to the default for a missing, negative or unreadable value. */
export function parseDailyBudget(value: string | undefined): number {
  const dollars = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isFinite(dollars) && dollars >= 0
    ? Math.round(dollars * MICRO_USD_PER_USD)
    : DEFAULT_DAILY_BUDGET_MICRO_USD;
}
