/**
 * Tests for the Isometric model look's geometry.
 * They confirm the rail's layers run from the back to the front, and a box's faces join along shared edges.
 * They also confirm the slab and its grid reach back by the slab's depth and cover the whole width.
 */
import { describe, expect, it } from "vitest";
import { DEPTH, RAIL_LAYERS, SLAB_DEPTH_STEPS, TILE_WIDTH, boxFaces, railOffsets, slabGrid, slabTop } from "./isoLayout";

describe("railOffsets", () => {
  it("runs from the back of the rail to the front, front last", () => {
    const offsets = railOffsets();
    expect(offsets).toHaveLength(RAIL_LAYERS);
    expect(offsets[0]).toEqual(DEPTH);
    expect(offsets.at(-1)).toEqual({ x: 0, y: 0 });
  });
});

describe("boxFaces", () => {
  it("joins the front, side and top along shared edges", () => {
    const faces = boxFaces(100, 50, 200, 10);
    expect(faces.front).toBe("90,50 110,50 110,200 90,200");
    expect(faces.side.startsWith("110,50 ")).toBe(true);
    expect(faces.top.endsWith(" 110,50")).toBe(true);
    expect(faces.top).toContain(`${110 + DEPTH.x},${50 + DEPTH.y}`);
  });
});

describe("slab", () => {
  it("reaches back by the slab depth along the whole width", () => {
    const back = { x: DEPTH.x * SLAB_DEPTH_STEPS, y: 300 + DEPTH.y * SLAB_DEPTH_STEPS };
    expect(slabTop(480, 300)).toBe(`0,300 ${back.x},${back.y} ${480 + back.x},${back.y} 480,300`);
  });

  it("draws a line into the picture at every tile and one across at every inner depth step", () => {
    const grid = slabGrid(TILE_WIDTH * 4, 300);
    expect(grid).toHaveLength(5 + SLAB_DEPTH_STEPS - 1);
    expect(grid[0].from).toEqual({ x: 0, y: 300 });
  });
});
