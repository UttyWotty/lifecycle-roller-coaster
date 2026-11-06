/**
 * Plain request handling for the extraction endpoint.
 * It validates input, calls an injected extractor and maps outcomes to safe responses.
 * It holds no HTTP or vendor code, so every path can be tested with a fake extractor.
 */
import { z } from "zod";
import { MAX_STORY_LENGTH, getStoryStatus } from "@/lib/story/storyInput";
import { ExtractionError, type ExtractionErrorCode } from "./errors";
import { finalizeDraft, type ExtractionResult } from "./extraction";
import type { EventExtractor } from "./extractor";

export type RequestErrorCode = "invalid_request" | "payload_too_large" | "unsupported_media_type";
export type ExtractErrorCode = ExtractionErrorCode | RequestErrorCode;
export interface ExtractErrorBody {
  error: ExtractErrorCode;
}
export interface ExtractResponse {
  status: number;
  body: ExtractionResult | ExtractErrorBody;
}

/** Worst case for JSON text: six bytes per story character, plus room for the envelope. */
export const MAX_BODY_BYTES = MAX_STORY_LENGTH * 6 + 1024;

const JSON_MEDIA_TYPE = "application/json";
const STATUS_OK = 200;

const ERROR_STATUS: Record<ExtractErrorCode, number> = {
  invalid_request: 400,
  payload_too_large: 413,
  unsupported_media_type: 415,
  refused: 422,
  truncated: 422,
  provider_failed: 502,
  not_configured: 503,
  rate_limited: 503,
};

const requestSchema = z.object({ story: z.string() });

export function errorResponse(code: ExtractErrorCode): ExtractResponse {
  return { status: ERROR_STATUS[code], body: { error: code } };
}

function parseStory(body: string): string | null {
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return null;
  }
  const request = requestSchema.safeParse(json);
  if (!request.success || getStoryStatus(request.data.story) !== "ready") {
    return null;
  }
  return request.data.story.trim();
}

/** Validates a request and runs extraction, never returning story text or provider detail in errors. */
export async function handleExtractRequest(
  contentType: string | null,
  body: string,
  extractor: EventExtractor,
  signal: AbortSignal,
): Promise<ExtractResponse> {
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType !== JSON_MEDIA_TYPE) {
    return errorResponse("unsupported_media_type");
  }
  const story = parseStory(body);
  if (story === null) {
    return errorResponse("invalid_request");
  }
  try {
    const draft = await extractor.extract(story, signal);
    return { status: STATUS_OK, body: finalizeDraft(draft, extractor.isDemo) };
  } catch (error) {
    return errorResponse(error instanceof ExtractionError ? error.code : "provider_failed");
  }
}
