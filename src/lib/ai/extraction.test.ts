/**
 * Tests for turning model output into validated events.
 * They cover id assignment, stop reasons, malformed output and contract violations.
 * They also confirm errors never carry story content.
 */
import { describe, expect, it } from "vitest";
import { lifeEventListSchema } from "@/lib/events/schema";
import { ExtractionError } from "./errors";
import { finalizeDraft, readModelOutput, type ExtractionDraft } from "./extraction";

const DRAFT_EVENT: ExtractionDraft["events"][number] = {
  date: "2015",
  title: "Started University",
  description: "Started a new academic journey.",
  category: "education",
  sentiment: "positive",
  impact: 8,
  confidence: 0.95,
};
const DRAFT: ExtractionDraft = { events: [DRAFT_EVENT], clarifications: ["Which year?"] };

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
    const result = finalizeDraft({ events: [DRAFT_EVENT, DRAFT_EVENT], clarifications: [] });
    expect(result.events.map(({ id }) => id)).toEqual(["event_001", "event_002"]);
    expect(lifeEventListSchema.safeParse({ events: result.events }).success).toBe(true);
  });

  it("keeps clarifications", () => {
    expect(finalizeDraft(DRAFT).clarifications).toEqual(["Which year?"]);
  });

  it("accepts a story with no events", () => {
    expect(finalizeDraft({ events: [], clarifications: [] }).events).toEqual([]);
  });

  it("rejects a draft that breaks the contract", () => {
    const invalid = { events: [{ ...DRAFT_EVENT, impact: 99 }], clarifications: [] };
    expect(codeOf(() => finalizeDraft(invalid))).toBe("provider_failed");
  });
});

describe("readModelOutput", () => {
  it("parses a complete response", () => {
    expect(readModelOutput("end_turn", JSON.stringify(DRAFT))).toEqual(DRAFT);
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
