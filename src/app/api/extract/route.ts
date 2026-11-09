/**
 * HTTP adapter for story extraction.
 * It blocks automated requests, reads the body under a hard size limit, and wraps real readings in usage limits.
 * Logs record only an error code, so story content never reaches them.
 */
import { NextResponse } from "next/server";
import { createAnthropicExtractor } from "@/lib/ai/anthropicExtractor";
import { MAX_BODY_BYTES, errorResponse, handleExtractRequest, type ExtractResponse } from "@/lib/ai/extractRequest";
import { createFixtureExtractor } from "@/lib/ai/fixtureExtractor";
import type { EventExtractor } from "@/lib/ai/extractor";
import { createLimitedExtractor } from "@/lib/ai/limitedExtractor";
import { DAILY_BUDGET_MICRO_USD, isAutomatedRequest, limitStore, visitorIdFor } from "./publicAccess";

/** Two provider attempts of up to 60 seconds each, plus room for the limit store. Vercel Hobby allows up to 300. */
export const maxDuration = 150;

const EXTRACTOR_MODE = process.env.EXTRACTOR_MODE ?? "anthropic";
const FIXTURE_MODE = "fixture";
const LOGGED_STATUS_FLOOR = 500;
const IS_FIXTURE = EXTRACTOR_MODE === FIXTURE_MODE;
const baseExtractor = IS_FIXTURE ? createFixtureExtractor() : createAnthropicExtractor();

/** Demo readings cost nothing, so only real readings count against a visitor's limits and the daily budget. */
function extractorFor(request: Request): EventExtractor {
  if (IS_FIXTURE) {
    return baseExtractor;
  }
  return createLimitedExtractor(baseExtractor, {
    store: limitStore,
    visitorId: visitorIdFor(request.headers),
    dailyBudgetMicroUsd: DAILY_BUDGET_MICRO_USD,
    now: () => new Date(),
  });
}

/** Reads the body as a stream, stopping early so an oversized request cannot fill memory. */
async function readBodyWithinLimit(request: Request): Promise<string | null> {
  if (request.body === null) {
    return "";
  }
  const decoder = new TextDecoder();
  const reader = request.body.getReader();
  let text = "";
  let bytes = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    bytes += chunk.value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}

async function respond(request: Request): Promise<ExtractResponse> {
  if (await isAutomatedRequest()) {
    return errorResponse("forbidden");
  }
  const body = await readBodyWithinLimit(request);
  if (body === null) {
    return errorResponse("payload_too_large");
  }
  return handleExtractRequest(request.headers.get("content-type"), body, extractorFor(request), request.signal);
}

export async function POST(request: Request): Promise<NextResponse> {
  const response = await respond(request);
  if (response.status >= LOGGED_STATUS_FLOOR && "error" in response.body) {
    console.error("Extraction failed with code %s", response.body.error);
  }
  return NextResponse.json(response.body, { status: response.status });
}
