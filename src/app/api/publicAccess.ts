/**
 * Server adapter that turns the environment and the incoming request into public-use protection for every route.
 * It picks the limit and feedback stores, hashes the visitor's address into an id, and runs Vercel's bot check.
 * On Vercel a missing store fails closed, so a misconfigured deployment can never spend tokens or lose feedback.
 */
import { createHmac } from "node:crypto";
import { checkBotId } from "botid/server";
import { createMemoryFeedbackStore, createUpstashFeedbackStore, unconfiguredFeedbackStore, type FeedbackStore } from "@/lib/feedback/feedbackStore";
import { LimitStoreError, type LimitStore } from "@/lib/limits/limitStore";
import { createMemoryLimitStore } from "@/lib/limits/memoryLimitStore";
import { createUpstashLimitStore } from "@/lib/limits/upstashLimitStore";
import { parseDailyBudget } from "@/lib/limits/usageLimits";

/** Vercel sets VERCEL to "1" on every deployment, preview and production alike. */
const IS_VERCEL = (process.env.VERCEL ?? "") === "1";
/** The Upstash integration may name its variables either way, so both are accepted. */
const STORE_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const STORE_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
/** Keys the visitor hash. Defaults to the store token, which is already a secret only the server knows. */
const VISITOR_SECRET = process.env.RATE_LIMIT_SECRET ?? STORE_TOKEN;
/** Dollars per UTC day across all visitors. Defaults to $1 when unset or unreadable. */
export const DAILY_BUDGET_MICRO_USD = parseDailyBudget(process.env.DAILY_BUDGET_USD);

const UNKNOWN_ADDRESS = "unknown";
const VISITOR_ID_LENGTH = 32;
/** Used only off Vercel, where there is no secret to protect and one local process holds the counters. */
const LOCAL_SECRET = "local-development";

const unconfiguredStore: LimitStore = {
  async increment(): Promise<number> {
    throw new LimitStoreError("No limit store is configured");
  },
};

function chooseStore(): LimitStore {
  if (STORE_URL !== "" && STORE_TOKEN !== "") {
    return createUpstashLimitStore({ url: STORE_URL, token: STORE_TOKEN });
  }
  return IS_VERCEL ? unconfiguredStore : createMemoryLimitStore();
}

export const limitStore = chooseStore();

function chooseFeedbackStore(): FeedbackStore {
  if (STORE_URL !== "" && STORE_TOKEN !== "") {
    return createUpstashFeedbackStore({ url: STORE_URL, token: STORE_TOKEN });
  }
  return IS_VERCEL ? unconfiguredFeedbackStore : createMemoryFeedbackStore();
}

export const feedbackStore = chooseFeedbackStore();

/** Vercel sets the deployed commit; local runs say so instead. */
const COMMIT = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
const LOCAL_BUILD = "local";
const SHORT_COMMIT_LENGTH = 7;
export const BUILD = COMMIT === "" ? LOCAL_BUILD : COMMIT.slice(0, SHORT_COMMIT_LENGTH);

/**
 * The client address as Vercel reports it. Vercel overwrites these headers, so a visitor cannot set them there.
 * Off Vercel they are trusted as sent, which only matters for local runs; deployments must run on Vercel.
 */
function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || UNKNOWN_ADDRESS;
}

/** A keyed one-way hash of the address, so counters never hold a raw IP address. */
export function visitorIdFor(headers: Headers): string {
  const secret = VISITOR_SECRET !== "" ? VISITOR_SECRET : LOCAL_SECRET;
  return createHmac("sha256", secret).update(clientAddress(headers)).digest("hex").slice(0, VISITOR_ID_LENGTH);
}

/**
 * True when Vercel's bot check flags the request. Off Vercel there is nothing to check against.
 * If the check itself fails, the request is treated as automated, because letting it through could spend tokens.
 */
export async function isAutomatedRequest(): Promise<boolean> {
  if (!IS_VERCEL) {
    return false;
  }
  try {
    const verification = await checkBotId();
    return verification.isBot;
  } catch {
    return true;
  }
}
