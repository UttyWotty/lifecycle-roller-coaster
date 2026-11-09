/**
 * Tests for share-link encoding.
 * They confirm a ride survives a round trip and that descriptions and other private fields never enter a link.
 * They also confirm that broken, tampered, foreign and oversized links read back as no ride.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import {
  MAX_FRAGMENT_LENGTH,
  SHARE_FRAGMENT_KEY,
  decodeSharedRide,
  encodeSharedRide,
  type SharedRideInput,
} from "./sharedRide";

const [sample] = SAMPLE_LIVES;
const RIDE: SharedRideInput = {
  title: "Ünïcode ride ✓",
  style: "loops",
  theme: "ocean",
  rider: "dino",
  events: sample.events,
  chapters: sample.chapters,
};

function payloadOf(fragment: string): Record<string, unknown> {
  const base64 = fragment.slice(SHARE_FRAGMENT_KEY.length).replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function encodePayload(payload: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return `${SHARE_FRAGMENT_KEY}${btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")}`;
}

describe("encodeSharedRide and decodeSharedRide", () => {
  const fragment = encodeSharedRide(RIDE);
  const decoded = decodeSharedRide(`#${fragment}`);

  it("bring back the ride's events, chapters, title and look", () => {
    expect(decoded?.title).toBe(RIDE.title);
    expect(decoded?.style).toBe("loops");
    expect(decoded?.theme).toBe("ocean");
    expect(decoded?.rider).toBe("dino");
    const fields = (events: readonly SharedRideInput["events"][number][]) =>
      events.map(({ title, date, category, sentiment, impact }) => ({ title, date, category, sentiment, impact }));
    expect(fields(decoded?.events ?? [])).toEqual(fields(sample.events));
    expect(decoded?.chapters.map(({ title }) => title)).toEqual(sample.chapters.map(({ title }) => title));
    expect(decoded?.chapters[0].eventIds.length).toBe(sample.chapters[0].eventIds.length);
  });

  it("use only link-safe characters", () => {
    expect(fragment).toMatch(/^r=[A-Za-z0-9_-]+$/);
  });

  it("never carry descriptions, even if events have them", () => {
    const withSecret = sample.events.map((event) => ({ ...event, description: "ZZPRIVATEZZ" }));
    const encoded = encodeSharedRide({ ...RIDE, events: withSecret });
    expect(JSON.stringify(payloadOf(encoded))).not.toContain("ZZPRIVATEZZ");
    expect(decodeSharedRide(encoded)?.events.every(({ description }) => description === "")).toBe(true);
  });

  it("drop chapter links to events that are not shared", () => {
    const chapters = [{ title: "Lost", eventIds: ["not-there"] }, ...sample.chapters];
    expect(decodeSharedRide(encodeSharedRide({ ...RIDE, chapters }))?.chapters[0].title).not.toBe("Lost");
  });
});

describe("decodeSharedRide refuses", () => {
  const good = payloadOf(encodeSharedRide(RIDE));

  it("fragments that are not rides", () => {
    for (const fragment of ["", "#", "#top", "#r=", "#r=!!!", "#r=e30", `#r=${"A".repeat(MAX_FRAGMENT_LENGTH)}`]) {
      expect(decodeSharedRide(fragment)).toBeNull();
    }
  });

  it("a truncated link", () => {
    const fragment = encodeSharedRide(RIDE);
    expect(decodeSharedRide(fragment.slice(0, fragment.length - 10))).toBeNull();
  });

  it("tampered values", () => {
    const cases = [
      { ...good, v: 2 },
      { ...good, s: "rocket" },
      { ...good, e: [] },
      { ...good, e: [["Title", "2015-02-31", 0, 0, 5]] },
      { ...good, e: [["Title", "2015", 99, 0, 5]] },
      { ...good, e: [["Title", "2015", 0, 0, 11]] },
      { ...good, t: "x".repeat(500) },
    ];
    for (const payload of cases) {
      expect(decodeSharedRide(encodePayload(payload))).toBeNull();
    }
  });

  it("ignores chapter indexes past the last event", () => {
    const decoded = decodeSharedRide(encodePayload({ ...good, c: [["Ghost", [999]]] }));
    expect(decoded?.chapters).toEqual([]);
  });
});
