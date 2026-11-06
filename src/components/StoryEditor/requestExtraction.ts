/**
 * Browser adapter that sends a story to the extraction endpoint.
 * It validates the server response and turns every failure into a friendly message.
 * This is the only place in the client where the story leaves the browser.
 */
import { extractionResultSchema, type ExtractionResult } from "@/lib/ai/extraction";
import { getExtractionMessage } from "@/lib/ai/extractionMessages";

const ENDPOINT = "/api/extract";
const NETWORK_MESSAGE = "We could not reach the server. Check your connection and try again.";

export type ExtractionOutcome =
  | { ok: true; result: ExtractionResult }
  | { ok: false; message: string };

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
    return { ok: false, message: NETWORK_MESSAGE };
  }
  const json = await readJson(response);
  const result = response.ok ? extractionResultSchema.safeParse(json) : null;
  return result?.success
    ? { ok: true, result: result.data }
    : { ok: false, message: getExtractionMessage(readErrorCode(json)) };
}
