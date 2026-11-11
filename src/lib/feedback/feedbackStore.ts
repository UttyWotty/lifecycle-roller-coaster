/**
 * Where kept feedback goes: an interface, an in-memory list for local runs and tests, and the Upstash list.
 * The Upstash store adds each message to the front of one list and trims it to the newest few hundred in one call.
 * A store that cannot keep a message throws FeedbackStoreError, and the visitor is told to try again later.
 */
import { UpstashError, runPipeline, type UpstashSettings } from "@/lib/upstash/upstashPipeline";
import { FEEDBACK_LIST_KEY, KEPT_FEEDBACK, type FeedbackRecord } from "./feedback";

export interface FeedbackStore {
  add(record: FeedbackRecord): Promise<void>;
}

export class FeedbackStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackStoreError";
  }
}

const LAST_KEPT_INDEX = KEPT_FEEDBACK - 1;
const FIRST_INDEX = 0;

/** Keeps messages in this process only, newest first, for local runs and tests. */
export function createMemoryFeedbackStore(): FeedbackStore & { records: FeedbackRecord[] } {
  const records: FeedbackRecord[] = [];
  return {
    records,
    async add(record: FeedbackRecord): Promise<void> {
      records.unshift(record);
      records.splice(KEPT_FEEDBACK);
    },
  };
}

export function createUpstashFeedbackStore(settings: UpstashSettings): FeedbackStore {
  return {
    async add(record: FeedbackRecord): Promise<void> {
      try {
        const replies = await runPipeline(settings, [
          ["LPUSH", FEEDBACK_LIST_KEY, JSON.stringify(record)],
          ["LTRIM", FEEDBACK_LIST_KEY, String(FIRST_INDEX), String(LAST_KEPT_INDEX)],
        ]);
        if (replies.some((reply) => reply.error !== undefined)) {
          throw new FeedbackStoreError("Feedback store refused the message");
        }
      } catch (error) {
        throw error instanceof FeedbackStoreError ? error : new FeedbackStoreError(error instanceof UpstashError ? error.message : "Feedback store unreachable");
      }
    },
  };
}

/** A store for a deployment with no Upstash settings: it refuses every message, so nothing is silently lost. */
export const unconfiguredFeedbackStore: FeedbackStore = {
  async add(): Promise<void> {
    throw new FeedbackStoreError("No feedback store is configured");
  },
};
