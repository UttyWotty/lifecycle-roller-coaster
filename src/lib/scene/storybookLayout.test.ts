/**
 * Tests for the Storybook world's layout.
 * They confirm each chapter is a page in alternating tints, with a fold where each page turns.
 * They also confirm every stop hangs on one thread from a garland, with pennants in the wide gaps.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { garlandPoints, pageFolds, pennants, storyPages, threadsFor } from "./storybookLayout";

function stop(id: string, x: number, y: number): TrackStop {
  return { id, x, y, level: 0, title: id, date: null, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

describe("storyPages", () => {
  it("is one page with no folds without chapters", () => {
    const pages = storyPages([], 800);
    expect(pages).toEqual([{ from: 0, to: 800, tint: 0 }]);
    expect(pageFolds(pages)).toEqual([]);
  });

  it("gives each chapter a page in alternating tints, folding where each turns", () => {
    const pages = storyPages(
      [
        { title: "A", start: 20, end: 280 },
        { title: "B", start: 300, end: 580 },
        { title: "C", start: 600, end: 780 },
      ],
      800,
    );
    expect(pages.map(({ tint }) => tint)).toEqual([0, 1, 0]);
    expect(pageFolds(pages)).toEqual([300, 600]);
  });
});

describe("threadsFor", () => {
  it("hangs every stop on one thread from the top to just above its marker", () => {
    const threads = threadsFor([stop("a", 100, 300), stop("b", 200, 10)], 40);
    expect(threads).toEqual([
      { id: "a", x: 100, top: 40, bottom: 286 },
      { id: "b", x: 200, top: 40, bottom: 40 },
    ]);
  });
});

describe("garland", () => {
  it("runs edge to edge through every thread, with pennants in wide gaps", () => {
    const threads = threadsFor([stop("b", 300, 200), stop("a", 100, 200), stop("c", 330, 200)], 0);
    const points = garlandPoints(threads, 500);
    expect(points).toEqual([0, 100, 300, 330, 500]);
    expect(pennants(points)).toEqual([
      { x: 50, color: 0 },
      { x: 200, color: 1 },
      { x: 415, color: 2 },
    ]);
  });
});
