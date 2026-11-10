/**
 * Tests for the extraction error messages.
 * They confirm known codes get specific guidance and unknown values get the fallback.
 * They also confirm that object prototype names are not treated as codes, and that messages come in each language.
 */
import { describe, expect, it } from "vitest";
import { FALLBACK_MESSAGE_KEY, getExtractionMessage, getExtractionMessageKey } from "./extractionMessages";

const FALLBACK = getExtractionMessage(undefined);

describe("getExtractionMessage", () => {
  it("gives a refusal specific, blame-free guidance", () => {
    expect(getExtractionMessage("refused")).toContain("You did nothing wrong");
  });

  it.each([
    ["visitor_limit", "sample life"],
    ["daily_limit", "come back tomorrow"],
    ["forbidden", "reload the page"],
  ])("explains %s and suggests what to do", (code, hint) => {
    expect(getExtractionMessage(code)).toContain(hint);
  });

  it.each([undefined, null, 42, "unknown_code", "toString", "constructor"])(
    "falls back for %s",
    (code) => {
      expect(getExtractionMessage(code)).toBe(FALLBACK);
    },
  );

  it("gives a message key the interface can translate", () => {
    expect(getExtractionMessageKey("daily_limit")).toBe("story.errorDailyLimit");
    expect(getExtractionMessageKey("provider_failed")).toBe(FALLBACK_MESSAGE_KEY);
    expect(getExtractionMessageKey("toString")).toBe(FALLBACK_MESSAGE_KEY);
  });

  it("speaks Turkish when asked, and English by default", () => {
    expect(getExtractionMessage("refused", "tr")).toContain("Senin bir hatan yok");
    expect(getExtractionMessage("unknown_code", "tr")).not.toBe(FALLBACK);
    expect(getExtractionMessage("refused", "en")).toBe(getExtractionMessage("refused"));
  });
});
