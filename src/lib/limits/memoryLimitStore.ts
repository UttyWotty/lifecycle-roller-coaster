/**
 * In-process counter store for local runs and tests.
 * Counters live only as long as the server process, so it suits one machine, never a serverless host.
 * The clock is injected, so expiry can be tested without waiting.
 */
import type { LimitStore } from "./limitStore";

interface Counter {
  total: number;
  expiresAt: number;
}

const MS_PER_SECOND = 1000;

export function createMemoryLimitStore(now: () => number = Date.now): LimitStore {
  const counters = new Map<string, Counter>();
  return {
    async increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
      const time = now();
      const current = counters.get(key);
      const total = (current && current.expiresAt > time ? current.total : 0) + amount;
      counters.set(key, { total, expiresAt: time + ttlSeconds * MS_PER_SECOND });
      return total;
    },
  };
}
