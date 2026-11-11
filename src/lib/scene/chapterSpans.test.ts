/**
 * Tests for turning chapters into spans across the drawing.
 * They confirm a ride with no chapters is one span covering everything.
 * They also confirm chapters are ordered, numbered and stretched to meet edge to edge.
 */
import { describe, expect, it } from "vitest";
import { chapterSpans } from "./chapterSpans";

describe("chapterSpans", () => {
  it("is one span without chapters", () => {
    expect(chapterSpans([], 500)).toEqual([{ from: 0, to: 500, index: 0 }]);
  });

  it("orders chapters and stretches them to cover the width", () => {
    const spans = chapterSpans(
      [
        { title: "B", start: 300, end: 450 },
        { title: "A", start: 40, end: 260 },
      ],
      600,
    );
    expect(spans).toEqual([
      { from: 0, to: 300, index: 0 },
      { from: 300, to: 600, index: 1 },
    ]);
  });
});
