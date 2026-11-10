/**
 * Tests for naming the people in a ride together.
 * They confirm one, two and several names read the way people say them.
 * They also confirm an empty list gives an empty string, and that Turkish joins with its own word.
 */
import { describe, expect, it } from "vitest";
import { namesInWords } from "./names";

describe("namesInWords", () => {
  it("joins names with commas and a final and", () => {
    expect(namesInWords([])).toBe("");
    expect(namesInWords(["Ana"])).toBe("Ana");
    expect(namesInWords(["Ana", "Ben"])).toBe("Ana and Ben");
    expect(namesInWords(["Ana", "Ben", "Cem", "Dee"])).toBe("Ana, Ben, Cem and Dee");
  });

  it("joins names in Turkish", () => {
    expect(namesInWords(["Ana", "Ben"], "tr")).toBe("Ana ve Ben");
    expect(namesInWords(["Ana", "Ben", "Cem"], "tr")).toBe("Ana, Ben ve Cem");
  });
});
