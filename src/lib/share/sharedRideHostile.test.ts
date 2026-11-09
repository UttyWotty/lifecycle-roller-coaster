/**
 * Hostile-input tests for the share link decoder.
 * They feed oversized, malformed, wrongly typed and prototype-polluting payloads and expect null, never a throw.
 * They also check that valid-looking extras never survive decoding and that the global prototype stays clean.
 */
import { describe, expect, it } from "vitest";
import { decodeSharedRide, encodeSharedRide, MAX_FRAGMENT_LENGTH } from "./sharedRide";

function pack(value: unknown, raw = false): string {
  const text = raw ? (value as string) : JSON.stringify(value);
  return `r=${Buffer.from(text, "utf8").toString("base64url")}`;
}



function validBase(): Record<string, unknown> {
  const ok = encodeSharedRide({
    title: "T", style: "coaster", theme: "classic", rider: "cat",
    events: [{ id: "a", date: "2020", title: "A", description: "d", category: "career", sentiment: "positive", impact: 5, confidence: 1 } as never],
    chapters: [],
  });
  return JSON.parse(Buffer.from(ok.slice(2), "base64url").toString("utf8"));
}

describe("decodeSharedRide hostile input", () => {
  const good = validBase();
  const cases: Record<string, unknown> = {
    "impact 11": { ...good, e: [["A", "2020", 0, 0, 11]] },
    "impact 0": { ...good, e: [["A", "2020", 0, 0, 0]] },
    "impact float": { ...good, e: [["A", "2020", 0, 0, 5.5]] },
    "impact NaN string": { ...good, e: [["A", "2020", 0, 0, "5"]] },
    "bad date": { ...good, e: [["A", "2020-13-45", 0, 0, 5]] },
    "bad date text": { ...good, e: [["A", "<script>", 0, 0, 5]] },
    "negative category": { ...good, e: [["A", "2020", -1, 0, 5]] },
    "huge category": { ...good, e: [["A", "2020", 1e9, 0, 5]] },
    "no events": { ...good, e: [] },
    "too many events": { ...good, e: Array.from({ length: 101 }, () => ["A", "2020", 0, 0, 5]) },
    "extra tuple len": { ...good, e: [["A", "2020", 0, 0, 5, "desc"]] },
    "wrong version": { ...good, v: 2 },
    "null": null,
    "array": [],
    "string": "x",
    "number": 5,
    "title long": { ...good, t: "x".repeat(10000) },
    "chapter title empty": { ...good, c: [["", [0]]] },
    "nested": JSON.parse("[".repeat(500) + "]".repeat(500)),
  };
  for (const [name, value] of Object.entries(cases)) {
    it(`rejects ${name}`, () => {
      expect(decodeSharedRide(pack(value))).toBeNull();
    });
  }

  it("rejects over-length, bad base64, invalid utf8, empty", () => {
    expect(decodeSharedRide("r=" + "A".repeat(MAX_FRAGMENT_LENGTH))).toBeNull();
    expect(decodeSharedRide("r=!!!!")).toBeNull();
    expect(decodeSharedRide("r=" + Buffer.from([0xff, 0xfe, 0xfd]).toString("base64url"))).toBeNull();
    expect(decodeSharedRide("r=")).toBeNull();
    expect(decodeSharedRide("")).toBeNull();
    expect(decodeSharedRide("#")).toBeNull();
    expect(decodeSharedRide("##r=" + pack(good).slice(2))).toBeNull();
  });

  it("drops out-of-range, negative and duplicate chapter indexes without throwing", () => {
    const withC = decodeSharedRide(pack({ ...good, c: [["Ch", [0, 0, 99, 1e9]]] }));
    expect(withC?.chapters[0].eventIds.every((id) => id.startsWith("shared_"))).toBe(true);
    expect(decodeSharedRide(pack({ ...good, c: [["Ch", [-1]]] }))).toBeNull();
    expect(decodeSharedRide(pack({ ...good, c: [["Ch", [99]]] }))?.chapters).toEqual([]);
  });

  it("ignores prototype keys and unknown keys, and does not pollute", () => {
    const text = JSON.stringify(good).replace("{", '{"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted":2}},"description":"secret","report":"r",');
    const ride = decodeSharedRide(pack(text, true));
    expect(ride).not.toBeNull();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(JSON.stringify(ride)).not.toContain("secret");
    expect(ride?.events[0].description).toBe("");
  });

  it("duplicate keys take the last value but stay valid", () => {
    const text = JSON.stringify(good).replace("{", '{"t":"first",');
    expect(decodeSharedRide(pack(text, true))?.title).toBe("T");
  });

  it("keeps control and unicode characters as plain strings", () => {
    const ride = decodeSharedRide(pack({ ...good, t: "<img src=x onerror=alert(1)>\\u0000", e: [["\\u0000<b>", "", 0, 0, 5]] }));
    expect(ride?.events[0].title).toContain("<b>");
  });

  it("lone surrogate title encodes and decodes without throwing", () => {
    expect(() => decodeSharedRide(pack({ ...good, t: "\ud800" }))).not.toThrow();
  });

  it("encode never emits description fields", () => {
    const frag = encodeSharedRide({
      title: "T", style: "coaster", theme: "classic", rider: "cat",
      events: [{ id: "a", date: null, title: "A", description: "SECRETDESC", category: "career", sentiment: "neutral", impact: 5, confidence: 0.2, extra: "SECRETX" } as never],
      chapters: [{ title: "C", eventIds: ["a", "missing"], summary: "SECRETSUM" } as never],
    });
    const text = Buffer.from(frag.slice(2), "base64url").toString("utf8");
    expect(text).not.toContain("SECRET");
  });
});
