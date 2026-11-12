/**
 * Tests for 8-Bit Life's layout and the shared big-move picker it uses.
 * They confirm blocks snap to the grid and stack from under the rail to the ground, never past it.
 * They also confirm banners mark big climbs and drops with the right words and keep clear of row cuts.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { BIG_MOVE } from "./bigMoves";
import { BANNER_HALF_WIDTH, BANNER_WORDS, PIXEL_BLOCK, blockStack, pixelBanners, snapToBlock } from "./pixelLayout";

function stop(id: string, x: number, level: number): TrackStop {
  return { id, x, y: 0, level, title: id, date: null, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

describe("blockStack", () => {
  it("snaps to the grid and stacks down to the ground without passing it", () => {
    const tops = blockStack(100, 200);
    expect(tops[0]).toBe(snapToBlock(100) + PIXEL_BLOCK);
    expect(tops.every((top) => top % PIXEL_BLOCK === 0)).toBe(true);
    expect((tops.at(-1) ?? 0) + PIXEL_BLOCK).toBeLessThanOrEqual(200);
  });

  it("is empty when the rail is at the ground", () => {
    expect(blockStack(200, 200)).toEqual([]);
  });
});

describe("pixelBanners", () => {
  it("flies LEVEL UP over big climbs and CHECKPOINT over big drops", () => {
    const stops = [stop("a", 200, 0), stop("b", 400, BIG_MOVE), stop("c", 600, 0), stop("d", 800, 1)];
    expect(pixelBanners(stops).map(({ id, mood }) => [id, BANNER_WORDS[mood]])).toEqual([
      ["b", "LEVEL UP!"],
      ["c", "CHECKPOINT"],
    ]);
  });

  it("leaves out a banner a row cut would split", () => {
    const gap = BANNER_HALF_WIDTH * 2 - 1;
    expect(pixelBanners([stop("a", gap, 0), stop("b", gap * 2, 10)])).toEqual([]);
  });
});
