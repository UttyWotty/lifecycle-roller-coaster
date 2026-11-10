/**
 * Tests for the parts of a drawing the story picture must not cut.
 * They confirm each stop label spans its estimated width around the stop, and each chapter name sits centred in its band.
 * They also confirm a cut only splits a span when it falls strictly inside it.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { cutsThrough, keepWholeSpans } from "./storySpans";

function stop(x: number, title: string, date: string | null): TrackStop {
  return { id: title, x, y: 0, level: 0, title, date, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

describe("keepWholeSpans", () => {
  it("covers each stop label around its stop", () => {
    const [span] = keepWholeSpans({ stops: [stop(500, "Ran out of money", "2019")], chapterBands: [] });
    expect(span.from).toBeLessThan(500);
    expect(span.to).toBeGreaterThan(500);
    expect(span.to - span.from).toBeGreaterThan(100);
    expect(span.from + span.to).toBe(1000);
  });

  it("centres a chapter name in its band and keeps it inside the band", () => {
    const [name] = keepWholeSpans({ stops: [], chapterBands: [{ title: "Rose", start: 100, end: 500 }] });
    expect(name.from + name.to).toBe(600);
    expect(name.to - name.from).toBe(32);
    const [long] = keepWholeSpans({ stops: [], chapterBands: [{ title: "A very long chapter name indeed", start: 0, end: 50 }] });
    expect(long).toEqual({ from: 0, to: 50 });
  });
});

describe("cutsThrough", () => {
  it("splits a span only from strictly inside it", () => {
    expect(cutsThrough(15, { from: 10, to: 20 })).toBe(true);
    expect(cutsThrough(10, { from: 10, to: 20 })).toBe(false);
    expect(cutsThrough(25, { from: 10, to: 20 })).toBe(false);
  });
});
