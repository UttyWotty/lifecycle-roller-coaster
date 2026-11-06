/**
 * HTTP adapter for story extraction.
 * It reads the request body under a hard size limit, chooses the extractor and delegates the rest.
 * Logs record only an error code, so story content never reaches them.
 */
import { NextResponse } from "next/server";
import { createAnthropicExtractor } from "@/lib/ai/anthropicExtractor";
import { MAX_BODY_BYTES, errorResponse, handleExtractRequest } from "@/lib/ai/extractRequest";
import { createFixtureExtractor } from "@/lib/ai/fixtureExtractor";

const EXTRACTOR_MODE = process.env.EXTRACTOR_MODE ?? "anthropic";
const FIXTURE_MODE = "fixture";
const LOGGED_STATUS_FLOOR = 500;
const extractor =
  EXTRACTOR_MODE === FIXTURE_MODE ? createFixtureExtractor() : createAnthropicExtractor();

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

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBodyWithinLimit(request);
  const response =
    body === null
      ? errorResponse("payload_too_large")
      : await handleExtractRequest(
          request.headers.get("content-type"),
          body,
          extractor,
          request.signal,
        );
  if (response.status >= LOGGED_STATUS_FLOOR && "error" in response.body) {
    console.error("Extraction failed with code %s", response.body.error);
  }
  return NextResponse.json(response.body, { status: response.status });
}
