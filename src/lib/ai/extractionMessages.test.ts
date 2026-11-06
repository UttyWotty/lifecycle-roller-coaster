/**
 * Tests for the extraction error messages.
 * They confirm known codes get specific guidance and unknown values get the fallback.
 * They also confirm that object prototype names are not treated as codes.
 */
import { describe, expect, it } from "vitest";
import { getExtractionMessage } from "./extractionMessages";

const FALLBACK = getExtractionMessage(undefined);

describe("getExtractionMessage", () => {
  it("gives a refusal specific, blame-free guidance", () => {
    expect(getExtractionMessage("refused")).toContain("You did nothing wrong");
  });

  it.each([undefined, null, 42, "unknown_code", "toString", "constructor"])(
    "falls back for %s",
    (code) => {
      expect(getExtractionMessage(code)).toBe(FALLBACK);
    },
  );
});
