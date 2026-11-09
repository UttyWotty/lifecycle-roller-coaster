/**
 * Tests for turning model output into validated events.
 * They cover id assignment, stop reasons, malformed output and contract violations.
 * They also confirm errors never carry story content.
 */
import { describe, expect, it } from "vitest";
import { lifeEventListSchema } from "@/lib/events/schema";
import { ExtractionError } from "./errors";
import { DRAFT_LIMITS, finalizeDraft, readModelOutput, type ExtractionDraft } from "./extraction";

const DRAFT_EVENT: ExtractionDraft["events"][number] = {
  date: "2015",
  title: "Started University",
  description: "Started a new academic journey.",
  category: "education",
  sentiment: "positive",
  impact: 8,
  confidence: 0.95,
};
const NO_INSIGHTS = { chapters: [], report: { headline: "", highlights: [] } };
const DRAFT: ExtractionDraft = { events: [DRAFT_EVENT], clarifications: ["Which year?"], ...NO_INSIGHTS };

function codeOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    return error instanceof ExtractionError ? error.code : "unexpected";
  }
  return "no error";
}

describe("finalizeDraft", () => {
  it("assigns unique sequential ids that pass the shared contract", () => {
    const result = finalizeDraft({ events: [DRAFT_EVENT, DRAFT_EVENT], clarifications: [], ...NO_INSIGHTS }, false);
    expect(result.events.map(({ id }) => id)).toEqual(["event_001", "event_002"]);
    expect(lifeEventListSchema.safeParse({ events: result.events }).success).toBe(true);
  });

  it("keeps clarifications", () => {
    expect(finalizeDraft(DRAFT, false).clarifications).toEqual(["Which year?"]);
  });

  it("accepts a story with no events", () => {
    expect(finalizeDraft({ events: [], clarifications: [], ...NO_INSIGHTS }, false).events).toEqual([]);
  });

  it("rejects a draft that breaks the contract", () => {
    const invalid = { events: [{ ...DRAFT_EVENT, impact: 99 }], clarifications: [], ...NO_INSIGHTS };
    expect(codeOf(() => finalizeDraft(invalid, false))).toBe("provider_failed");
  });
});

describe("readModelOutput", () => {
  it("parses a complete response", () => {
    expect(readModelOutput("end_turn", JSON.stringify(DRAFT))).toEqual(DRAFT);
  });

  it("accepts a draft right at every limit", () => {
    const full: ExtractionDraft = {
      events: Array(DRAFT_LIMITS.events).fill({ ...DRAFT_EVENT, title: "T".repeat(DRAFT_LIMITS.title) }),
      clarifications: Array(DRAFT_LIMITS.clarifications).fill("Which year?"),
      chapters: Array(DRAFT_LIMITS.chapters).fill({ title: "C", firstEvent: 1, lastEvent: 1 }),
      report: { headline: "H".repeat(DRAFT_LIMITS.headline), highlights: Array(DRAFT_LIMITS.highlights).fill("x") },
    };
    expect(readModelOutput("end_turn", JSON.stringify(full))).toEqual(full);
  });

  it("reports a refusal even when partial text exists", () => {
    expect(codeOf(() => readModelOutput("refusal", '{"events": ['))).toBe("refused");
  });

  it("reports a refusal with no text", () => {
    expect(codeOf(() => readModelOutput("refusal", null))).toBe("refused");
  });

  it("reports truncation instead of a parse failure", () => {
    expect(codeOf(() => readModelOutput("max_tokens", '{"events": ['))).toBe("truncated");
  });

  it.each([
    ["missing text", null],
    ["invalid JSON", "not json"],
    ["the wrong shape", '{"foo": 1}'],
    ["an impossible date", JSON.stringify({ ...DRAFT, events: [{ ...DRAFT_EVENT, date: "2015-02-31" }] })],
    ["an out-of-range impact", JSON.stringify({ ...DRAFT, events: [{ ...DRAFT_EVENT, impact: 11 }] })],
    ["too many events", JSON.stringify({ ...DRAFT, events: Array(DRAFT_LIMITS.events + 1).fill(DRAFT_EVENT) })],
    ["an overlong title", JSON.stringify({ ...DRAFT, events: [{ ...DRAFT_EVENT, title: "T".repeat(DRAFT_LIMITS.title + 1) }] })],
    ["too many highlights", JSON.stringify({ ...DRAFT, report: { headline: "Hi", highlights: Array(DRAFT_LIMITS.highlights + 1).fill("x") } })],
  ])("fails safely on %s", (_label, text) => {
    expect(codeOf(() => readModelOutput("end_turn", text))).toBe("provider_failed");
  });

  it("does not put model text in the error", () => {
    const secret = "ZZSECRETZZ";
    try {
      readModelOutput("end_turn", secret);
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
    expect.assertions(1);
  });
});

describe("finalizeDraft insights", () => {
  const events = [DRAFT_EVENT, DRAFT_EVENT, DRAFT_EVENT];

  it("turns chapter event numbers into ids, and drops bad chapters", () => {
    const result = finalizeDraft(
      {
        events,
        clarifications: [],
        chapters: [
          { title: "Early", firstEvent: 1, lastEvent: 2 },
          { title: "Late", firstEvent: 3, lastEvent: 99 },
          { title: "Nowhere", firstEvent: 40, lastEvent: 50 },
          { title: " ", firstEvent: 1, lastEvent: 1 },
        ],
        report: { headline: "", highlights: [] },
      },
      false,
    );
    expect(result.chapters).toEqual([
      { title: "Early", eventIds: ["event_001", "event_002"] },
      { title: "Late", eventIds: ["event_003"] },
    ]);
  });

  it("keeps a report with a headline, and drops an empty one", () => {
    const report = { headline: " Great ride. ", highlights: ["One.", " "] };
    const kept = finalizeDraft({ events, clarifications: [], chapters: [], report }, false);
    expect(kept.report).toEqual({ headline: "Great ride.", highlights: ["One."] });
    expect(finalizeDraft({ events, clarifications: [], ...NO_INSIGHTS }, false).report).toBeNull();
  });
});
