/**
 * Browser adapter that sends a story to the extraction endpoint.
 * It validates the server response and turns every failure into the key of a friendly message.
 * This is the only place in the client where the story leaves the browser.
 */
import { extractionResultSchema, type ExtractionResult } from "@/lib/ai/extraction";
import { NETWORK_MESSAGE_KEY, getExtractionMessageKey } from "@/lib/ai/extractionMessages";
import type { MessageKey } from "@/lib/i18n/messages";

const ENDPOINT = "/api/extract";

export type ExtractionOutcome =
  | { ok: true; result: ExtractionResult }
  | { ok: false; messageKey: MessageKey };

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readErrorCode(json: unknown): unknown {
  return typeof json === "object" && json !== null && "error" in json ? json.error : undefined;
}

export async function requestExtraction(
  story: string,
  signal: AbortSignal,
): Promise<ExtractionOutcome> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story }),
      signal,
    });
  } catch {
    return { ok: false, messageKey: NETWORK_MESSAGE_KEY };
  }
  const json = await readJson(response);
  const result = response.ok ? extractionResultSchema.safeParse(json) : null;
  return result?.success
    ? { ok: true, result: result.data }
    : { ok: false, messageKey: getExtractionMessageKey(readErrorCode(json)) };
}
