/**
 * Pure rules for turning raw model output into validated life events.
 * Models return drafts without ids, and the server assigns ids so they are always unique.
 * Nothing here performs I/O, and failures surface only as coded errors with no story content.
 */
import { z } from "zod";
import { lifeEventListSchema, lifeEventSchema, type LifeEvent } from "@/lib/events/schema";
import { ExtractionError } from "./errors";

const EVENT_ID_PREFIX = "event_";
const EVENT_ID_DIGITS = 3;
const STOP_REASON_REFUSAL = "refusal";
const STOP_REASON_MAX_TOKENS = "max_tokens";

export const extractionDraftSchema = z.object({
  events: z.array(lifeEventSchema.omit({ id: true })),
  clarifications: z.array(z.string()),
});

export const extractionResultSchema = z.object({
  events: z.array(lifeEventSchema),
  clarifications: z.array(z.string()),
});

export type ExtractionDraft = z.infer<typeof extractionDraftSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

/** Assigns sequential ids and re-validates the list against the shared event contract. */
export function finalizeDraft(draft: ExtractionDraft): ExtractionResult {
  const events: LifeEvent[] = draft.events.map((event, index) => ({
    ...event,
    id: `${EVENT_ID_PREFIX}${String(index + 1).padStart(EVENT_ID_DIGITS, "0")}`,
  }));
  const validated = lifeEventListSchema.safeParse({ events });
  if (!validated.success) {
    throw new ExtractionError("provider_failed");
  }
  return { events: validated.data.events, clarifications: draft.clarifications };
}

function parseDraftText(text: string): ExtractionDraft {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ExtractionError("provider_failed");
  }
  const draft = extractionDraftSchema.safeParse(json);
  if (!draft.success) {
    throw new ExtractionError("provider_failed");
  }
  return draft.data;
}

/** Checks why the model stopped before reading its text, because partial output is not valid JSON. */
export function readModelOutput(stopReason: string | null, text: string | null): ExtractionDraft {
  if (stopReason === STOP_REASON_REFUSAL) {
    throw new ExtractionError("refused");
  }
  if (stopReason === STOP_REASON_MAX_TOKENS) {
    throw new ExtractionError("truncated");
  }
  if (text === null) {
    throw new ExtractionError("provider_failed");
  }
  return parseDraftText(text);
}
