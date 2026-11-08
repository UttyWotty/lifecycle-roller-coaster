/**
 * Tests for the extraction system prompt.
 * They confirm template values are filled in rather than sent as literal placeholders.
 * They also confirm the prompt keeps the threshold the UI uses to label best guesses, and asks for varied chapter names.
 */
import { describe, expect, it } from "vitest";
import { LOW_CONFIDENCE_THRESHOLD } from "./extraction";
import { EXTRACTION_SYSTEM_PROMPT } from "./prompt";

describe("EXTRACTION_SYSTEM_PROMPT", () => {
  it("contains no unfilled template placeholders", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).not.toContain("${");
  });

  it("asks for chapters and a report, with no advice or scoring", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("Chapters:");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("Never diagnose, give advice, score the person");
  });

  it("keeps unstated feelings below the threshold even when they seem obvious", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain(`unless the person said how it felt, confidence stays below ${LOW_CONFIDENCE_THRESHOLD}`);
  });

  it("asks for varied chapter names rather than one repeated pattern", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("Vary the names");
    expect(EXTRACTION_SYSTEM_PROMPT).not.toMatch(/"[^"]* Era"/);
  });

  it("states the best-guess threshold used by the UI", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain(`confidence below ${LOW_CONFIDENCE_THRESHOLD}`);
  });
});
