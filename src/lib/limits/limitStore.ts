/**
 * Interface for the shared counter store behind rate limits and the daily budget.
 * The spend guard depends only on this, so tests use an in-memory store and production uses Upstash.
 * A store that cannot answer throws LimitStoreError, and callers treat that as "do not spend".
 */

export interface LimitStore {
  /** Adds the amount to the key, keeps the key for the given time, and returns the new total. */
  increment(key: string, amount: number, ttlSeconds: number): Promise<number>;
}

export class LimitStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LimitStoreError";
  }
}
