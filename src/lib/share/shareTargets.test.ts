/**
 * Tests for the social share URLs.
 * They confirm every target carries the full link, including the ride after "#", fully encoded.
 * They also confirm the message names the ride when it has a title.
 */
import { describe, expect, it } from "vitest";
import { shareMessage, shareTargets } from "./shareTargets";

const LINK = "https://example.com/ride#r=abc_-123";

describe("shareTargets", () => {
  it("keeps the whole link, fragment included, in every target", () => {
    for (const target of shareTargets(LINK, "Hello & welcome")) {
      expect(decodeURIComponent(target.url)).toContain(LINK);
      expect(target.url).not.toContain("#r=");
    }
  });

  it("offers X, WhatsApp, Telegram and email", () => {
    expect(shareTargets(LINK, "Hi").map(({ name }) => name)).toEqual(["X", "WhatsApp", "Telegram", "Email"]);
  });
});

describe("shareMessage", () => {
  it("names a titled ride and falls back for an untitled one", () => {
    expect(shareMessage("My 20s")).toBe('Take a ride through "My 20s".');
    expect(shareMessage("  ")).toBe("Take a ride through my life story.");
  });
});

describe("sharing in Turkish", () => {
  it("words the message and names email in Turkish", () => {
    expect(shareMessage("20'lerim", "tr")).toBe('"20\'lerim" treninde bir tur at.');
    expect(shareMessage("", "tr")).toBe("Hayat hikâyemde bir tur at.");
    expect(shareTargets(LINK, "Merhaba", "tr").map(({ name }) => name)).toEqual(["X", "WhatsApp", "Telegram", "E-posta"]);
  });
});
