/**
 * Decides whether a reading may start, and keeps the shared daily budget exact.
 * Before a reading it counts the visitor's hour and day, then reserves the worst case against the budget.
 * After the reading it swaps the reservation for the real cost, so concurrent readings can never overspend.
 */
import type { LimitStore } from "./limitStore";
import {
  DAY_KEY_TTL_SECONDS,
  HOUR_KEY_TTL_SECONDS,
  RESERVATION_MICRO_USD,
  VISITOR_DAILY_LIMIT,
  VISITOR_HOURLY_LIMIT,
  type LimitKeys,
} from "./usageLimits";

export type SpendRefusal = "visitor_limit" | "daily_limit";

export type ReserveResult =
  | { ok: true; reservedMicroUsd: number }
  | { ok: false; reason: SpendRefusal };

export interface SpendSettings {
  dailyBudgetMicroUsd: number;
}

/**
 * Counts this attempt for the visitor, then reserves budget for it.
 * Attempts over the visitor limit still count, so hammering the endpoint does not reset the window.
 */
export async function reserveSpend(store: LimitStore, keys: LimitKeys, settings: SpendSettings): Promise<ReserveResult> {
  const hourCount = await store.increment(keys.visitorHour, 1, HOUR_KEY_TTL_SECONDS);
  const dayCount = await store.increment(keys.visitorDay, 1, DAY_KEY_TTL_SECONDS);
  if (hourCount > VISITOR_HOURLY_LIMIT || dayCount > VISITOR_DAILY_LIMIT) {
    return { ok: false, reason: "visitor_limit" };
  }
  const spent = await store.increment(keys.budgetDay, RESERVATION_MICRO_USD, DAY_KEY_TTL_SECONDS);
  if (spent > settings.dailyBudgetMicroUsd) {
    await store.increment(keys.budgetDay, -RESERVATION_MICRO_USD, DAY_KEY_TTL_SECONDS);
    return { ok: false, reason: "daily_limit" };
  }
  return { ok: true, reservedMicroUsd: RESERVATION_MICRO_USD };
}

/** Replaces a reservation with what the reading really cost; a reading that cost nothing gives it all back. */
export async function settleSpend(
  store: LimitStore,
  keys: LimitKeys,
  reservedMicroUsd: number,
  actualMicroUsd: number,
): Promise<void> {
  const adjustment = actualMicroUsd - reservedMicroUsd;
  if (adjustment !== 0) {
    await store.increment(keys.budgetDay, adjustment, DAY_KEY_TTL_SECONDS);
  }
}
