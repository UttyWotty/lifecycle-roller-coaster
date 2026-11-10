/**
 * Tests for the app's language rules.
 * They confirm a saved choice wins, then the browser's languages, then English, and odd values are ignored.
 * They also confirm placeholders are filled and unknown ones are left alone.
 */
import { describe, expect, it } from "vitest";
import { LOCALES, NUMBER_LOCALES, fill, isLocale, pickLocale } from "./locales";

describe("pickLocale", () => {
  it("prefers the saved choice, then the browser, then English", () => {
    expect(pickLocale("tr", ["en-GB"])).toBe("tr");
    expect(pickLocale(null, ["de-DE", "tr-TR", "en"])).toBe("tr");
    expect(pickLocale(null, ["EN-us"])).toBe("en");
    expect(pickLocale(null, ["de", "fr"])).toBe("en");
    expect(pickLocale("xx", [])).toBe("en");
  });

  it("knows only its own languages", () => {
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("TR")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe("fill", () => {
  it("fills placeholders and leaves unknown ones alone", () => {
    expect(fill("Stop {number} of {count}", { number: 2, count: 7 })).toBe("Stop 2 of 7");
    expect(fill("Hi {name}, {missing}", { name: "Ana" })).toBe("Hi Ana, {missing}");
  });
});

describe("NUMBER_LOCALES", () => {
  it("formats numbers the way each language writes them", () => {
    expect(LOCALES.every((locale) => NUMBER_LOCALES[locale] !== "")).toBe(true);
    expect((20_000).toLocaleString(NUMBER_LOCALES.en)).toBe("20,000");
    expect((20_000).toLocaleString(NUMBER_LOCALES.tr)).toBe("20.000");
  });
});
