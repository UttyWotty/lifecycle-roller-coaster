/**
 * Upstash Redis adapter for the limit store, used when the app runs on a serverless host.
 * It sends INCRBY and EXPIRE in one REST pipeline call, so each increment is a single round trip.
 * Any network, auth or reply problem becomes LimitStoreError, and the caller then refuses to spend.
 */
import { LimitStoreError, type LimitStore } from "./limitStore";

export interface UpstashSettings {
  url: string;
  token: string;
}

interface PipelineReply {
  result?: unknown;
  error?: string;
}

const PIPELINE_PATH = "/pipeline";
/** A slow store must not hold a reading open; past this the request is refused instead. */
const STORE_TIMEOUT_MS = 3000;

export function createUpstashLimitStore({ url, token }: UpstashSettings): LimitStore {
  const endpoint = `${url.replace(/\/+$/, "")}${PIPELINE_PATH}`;
  return {
    async increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
      let replies: unknown;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify([
            ["INCRBY", key, String(amount)],
            ["EXPIRE", key, String(ttlSeconds)],
          ]),
          signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
          cache: "no-store",
        });
        if (!response.ok) {
          throw new LimitStoreError(`Limit store answered ${response.status}`);
        }
        replies = await response.json();
      } catch (error) {
        throw error instanceof LimitStoreError ? error : new LimitStoreError("Limit store unreachable");
      }
      const [counter] = Array.isArray(replies) ? (replies as PipelineReply[]) : [];
      if (typeof counter?.result !== "number") {
        throw new LimitStoreError("Limit store sent an unexpected reply");
      }
      return counter.result;
    },
  };
}
