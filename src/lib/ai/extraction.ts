/**
 * Pure rules for turning raw model output into validated life events.
 * Models return drafts without ids, and the server assigns ids so they are always unique.
 * Nothing here performs I/O, and failures surface only as coded errors with no story content.
 */
import { z } from "zod";
import { formatEventId } from "@/lib/events/editing";
import { lifeChapterSchema, lifeReportSchema, type LifeChapter, type LifeReport } from "@/lib/events/insights";
import { lifeEventListSchema, lifeEventSchema, type LifeEvent } from "@/lib/events/schema";
import { ExtractionError } from "./errors";

const STOP_REASON_REFUSAL = "refusal";
const STOP_REASON_MAX_TOKENS = "max_tokens";

/** Below this confidence an event is a suggestion, and the UI labels it as a best guess. */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/**
 * Upper bounds on what a model may return. A story is capped at 20,000 characters, so a real reading stays
 * far inside them; they exist so an instruction hidden in a story cannot make a huge or unreadable ride.
 */
export const DRAFT_LIMITS = {
  events: 100,
  title: 200,
  description: 2_000,
  clarifications: 20,
  clarification: 500,
  chapters: 20,
  chapterTitle: 120,
  headline: 300,
  highlights: 10,
  highlight: 500,
} as const;

const draftEventSchema = lifeEventSchema.omit({ id: true }).extend({
  title: z.string().min(1).max(DRAFT_LIMITS.title),
  description: z.string().max(DRAFT_LIMITS.description),
});

export const extractionDraftSchema = z.object({
  events: z.array(draftEventSchema).max(DRAFT_LIMITS.events),
  clarifications: z.array(z.string().max(DRAFT_LIMITS.clarification)).max(DRAFT_LIMITS.clarifications),
  /** Event numbers count from 1, in the order of the events list. */
  chapters: z
    .array(
      z.object({
        title: z.string().max(DRAFT_LIMITS.chapterTitle),
        firstEvent: z.number().int(),
        lastEvent: z.number().int(),
      }),
    )
    .max(DRAFT_LIMITS.chapters),
  report: z.object({
    headline: z.string().max(DRAFT_LIMITS.headline),
    highlights: z.array(z.string().max(DRAFT_LIMITS.highlight)).max(DRAFT_LIMITS.highlights),
  }),
});

export const extractionResultSchema = z.object({
  events: z.array(lifeEventSchema),
  clarifications: z.array(z.string()),
  isDemo: z.boolean().default(false),
  chapters: z.array(lifeChapterSchema).default([]),
  report: lifeReportSchema.nullable().default(null),
});

export type ExtractionDraft = z.infer<typeof extractionDraftSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

/** Turns event numbers into ids, dropping chapters that are unnamed or point at no events. */
function finalizeChapters(draft: ExtractionDraft, events: readonly LifeEvent[]): LifeChapter[] {
  return draft.chapters.flatMap(({ title, firstEvent, lastEvent }) => {
    const eventIds = events.slice(Math.max(firstEvent - 1, 0), Math.max(lastEvent, 0)).map(({ id }) => id);
    return title.trim() === "" || eventIds.length === 0 ? [] : [{ title: title.trim(), eventIds }];
  });
}

function finalizeReport({ headline, highlights }: ExtractionDraft["report"]): LifeReport | null {
  const kept = highlights.map((highlight) => highlight.trim()).filter((highlight) => highlight !== "");
  return headline.trim() === "" ? null : { headline: headline.trim(), highlights: kept };
}

/** Assigns sequential ids and re-validates the list against the shared event contract. */
export function finalizeDraft(draft: ExtractionDraft, isDemo: boolean): ExtractionResult {
  const events: LifeEvent[] = draft.events.map((event, index) => ({
    ...event,
    id: formatEventId(index + 1),
  }));
  const validated = lifeEventListSchema.safeParse({ events });
  if (!validated.success) {
    throw new ExtractionError("provider_failed");
  }
  return {
    events: validated.data.events,
    clarifications: draft.clarifications,
    isDemo,
    chapters: finalizeChapters(draft, validated.data.events),
    report: finalizeReport(draft.report),
  };
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
