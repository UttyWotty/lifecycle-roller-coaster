/**
 * Tests for the Building blocks layout.
 * They confirm columns sit on the baseplate, stop short of the rail and alternate brick colours from the bottom up.
 * They also confirm trees are spread evenly with sizes taken in turn.
 */
import { describe, expect, it } from "vitest";
import { BRICK_HEIGHT, RAIL_CLEARANCE, TREE_LAYERS, TREE_SPACING, brickColumn, brickTrees } from "./brickLayout";

describe("brickColumn", () => {
  it("rests on the ground and stops short of the rail", () => {
    const bricks = brickColumn(100, 300);
    expect((bricks.at(-1)?.y ?? 0) + BRICK_HEIGHT).toBe(300);
    expect(bricks[0].y).toBeGreaterThanOrEqual(100 + RAIL_CLEARANCE);
  });

  it("alternates colours from the bottom brick up", () => {
    const bricks = brickColumn(0, BRICK_HEIGHT * 4 + RAIL_CLEARANCE);
    expect(bricks.map(({ tint }) => tint)).toEqual([1, 0, 1, 0]);
  });

  it("is empty when the rail is right on the ground", () => {
    expect(brickColumn(300, 300)).toEqual([]);
  });
});

describe("brickTrees", () => {
  it("spreads trees evenly, sizes taken in turn", () => {
    const trees = brickTrees(TREE_SPACING * 3);
    expect(trees.map(({ x }) => x)).toEqual([170, 510, 850]);
    expect(trees.map(({ layers }) => layers)).toEqual(TREE_LAYERS);
  });

  it("always has at least one tree", () => {
    expect(brickTrees(100)).toHaveLength(1);
  });
});
