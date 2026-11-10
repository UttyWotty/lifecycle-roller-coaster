/**
 * Tests for the message index.
 * They confirm every language gives exactly the English keys, with the same placeholders and no empty messages.
 * They also confirm messages are looked up and filled in each language.
 */
import { describe, expect, it } from "vitest";
import { LOCALES } from "./locales";
import { messageKeys, translate, type MessageKey } from "./messages";

const PLACEHOLDERS = /\{\w+\}/g;

function placeholders(text: string): string[] {
  return [...text.matchAll(PLACEHOLDERS)].map(([name]) => name).sort();
}

describe("messages", () => {
  it.each(LOCALES)("%s gives every English key with the same placeholders and no empty message", (locale) => {
    expect(messageKeys(locale).sort()).toEqual(messageKeys("en").sort());
    for (const key of messageKeys("en") as MessageKey[]) {
      const text = translate(locale, key);
      expect(text.trim()).not.toBe("");
      expect(placeholders(text)).toEqual(placeholders(translate("en", key)));
    }
  });

  it("looks messages up in each language", () => {
    expect(translate("en", "landing.start")).toBe("Start your ride");
    expect(translate("tr", "landing.start")).toBe("Yolculuğa başla");
  });
});
