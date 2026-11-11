/**
 * Upstash Redis adapter for the limit store, used when the app runs on a serverless host.
 * It sends INCRBY and EXPIRE in one REST pipeline call, so each increment is a single round trip.
 * Any network, auth or reply problem becomes LimitStoreError, and the caller then refuses to spend.
 */
import { UpstashError, runPipeline, type UpstashSettings } from "@/lib/upstash/upstashPipeline";
import { LimitStoreError, type LimitStore } from "./limitStore";

export type { UpstashSettings };

export function createUpstashLimitStore(settings: UpstashSettings): LimitStore {
  return {
    async increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
      let counter: unknown;
      try {
        const [reply] = await runPipeline(settings, [
          ["INCRBY", key, String(amount)],
          ["EXPIRE", key, String(ttlSeconds)],
        ]);
        counter = reply?.result;
      } catch (error) {
        throw new LimitStoreError(error instanceof UpstashError ? error.message : "Limit store unreachable");
      }
      if (typeof counter !== "number") {
        throw new LimitStoreError("Limit store sent an unexpected reply");
      }
      return counter;
    },
  };
}
