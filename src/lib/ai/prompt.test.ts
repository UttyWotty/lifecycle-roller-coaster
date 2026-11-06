/**
 * Tests for the extraction system prompt.
 * They confirm template values are filled in rather than sent as literal placeholders.
 * They also confirm the prompt keeps the threshold the UI uses to label best guesses.
 */
import { describe, expect, it } from "vitest";
import { LOW_CONFIDENCE_THRESHOLD } from "./extraction";
import { EXTRACTION_SYSTEM_PROMPT } from "./prompt";

describe("EXTRACTION_SYSTEM_PROMPT", () => {
  it("contains no unfilled template placeholders", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).not.toContain("${");
  });

  it("states the best-guess threshold used by the UI", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain(`confidence below ${LOW_CONFIDENCE_THRESHOLD}`);
  });
});
