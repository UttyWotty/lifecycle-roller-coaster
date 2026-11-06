/**
 * Claude implementation of the event extractor interface.
 * This is the only module that imports the Anthropic SDK or reads its settings from the environment.
 * It checks the stop reason before reading any text, because the SDK parser throws on partial output.
 */
import "server-only";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ExtractionError, type ExtractionErrorCode } from "./errors";
import { extractionDraftSchema, readModelOutput, type ExtractionDraft } from "./extraction";
import type { EventExtractor } from "./extractor";
import { EXTRACTION_SYSTEM_PROMPT } from "./prompt";

const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const MAX_OUTPUT_TOKENS = 16_000;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 1;
const EFFORT = "medium";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
const FALLBACK_MODE = "default";
const OVERLOADED_STATUS = 529;
const STATUS_TO_CODE: Readonly<Record<number, ExtractionErrorCode>> = {
  401: "not_configured",
  403: "not_configured",
  429: "rate_limited",
  [OVERLOADED_STATUS]: "rate_limited",
};

function toExtractionError(error: unknown): ExtractionError {
  if (error instanceof ExtractionError) {
    return error;
  }
  const code = error instanceof APIError && error.status ? STATUS_TO_CODE[error.status] : undefined;
  return new ExtractionError(code ?? "provider_failed");
}

async function requestDraft(
  client: Anthropic,
  story: string,
  signal: AbortSignal,
): Promise<ExtractionDraft> {
  const message = await client.beta.messages.create(
    {
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      betas: [FALLBACK_BETA],
      fallbacks: FALLBACK_MODE,
      system: EXTRACTION_SYSTEM_PROMPT,
      output_config: { effort: EFFORT, format: betaZodOutputFormat(extractionDraftSchema) },
      messages: [{ role: "user", content: story }],
    },
    { signal },
  );
  console.info(
    "Extraction used %d input and %d output tokens",
    message.usage.input_tokens,
    message.usage.output_tokens,
  );
  const textBlocks = message.content.filter((block) => block.type === "text");
  return readModelOutput(message.stop_reason, textBlocks.at(-1)?.text ?? null);
}

export function createAnthropicExtractor(): EventExtractor {
  return {
    async extract(story: string, signal: AbortSignal): Promise<ExtractionDraft> {
      if (API_KEY === "") {
        throw new ExtractionError("not_configured");
      }
      const client = new Anthropic({
        apiKey: API_KEY,
        timeout: REQUEST_TIMEOUT_MS,
        maxRetries: MAX_RETRIES,
      });
      try {
        return await requestDraft(client, story, signal);
      } catch (error) {
        throw toExtractionError(error);
      }
    },
  };
}
