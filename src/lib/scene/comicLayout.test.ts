/**
 * Tests for Comic Book Mode's layout.
 * They confirm panels follow chapters, or group stops when there are none, and always cover the whole drawing.
 * They also confirm bursts mark only big moves, take their words in turn, and never sit where a row cut would split one.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { BIG_MOVE, BURST_HALF_WIDTH, STOPS_PER_PANEL, comicBursts, comicPanels } from "./comicLayout";

const WIDTH = 1200;
const GAP = 200;

function stop(id: string, x: number, level: number): TrackStop {
  return { id, x, y: 0, level, title: id, date: null, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

function evenStops(levels: readonly number[], gap = GAP): TrackStop[] {
  return levels.map((level, index) => stop(`s${index}`, (index + 1) * gap, level));
}

describe("comicPanels", () => {
  it("is one panel for a short ride without chapters", () => {
    expect(comicPanels([], evenStops([1, 2]), WIDTH)).toEqual([{ from: 0, to: WIDTH, tint: 0 }]);
  });

  it("groups stops without chapters, cutting halfway between them", () => {
    const stops = evenStops([1, 2, 3, 4, 5, 6, 7]);
    const panels = comicPanels([], stops, WIDTH);
    expect(panels).toHaveLength(Math.ceil(stops.length / STOPS_PER_PANEL));
    expect(panels[0]).toEqual({ from: 0, to: (stops[2].x + stops[3].x) / 2, tint: 0 });
    expect(panels.at(-1)?.to).toBe(WIDTH);
    expect(panels.map(({ tint }) => tint)).toEqual([0, 1, 2]);
  });

  it("follows the chapters when there are some", () => {
    const panels = comicPanels(
      [
        { title: "A", start: 20, end: 500 },
        { title: "B", start: 520, end: 1100 },
      ],
      evenStops([1, 2, 3, 4, 5]),
      WIDTH,
    );
    expect(panels).toEqual([
      { from: 0, to: 520, tint: 0 },
      { from: 520, to: WIDTH, tint: 1 },
    ]);
  });
});

describe("comicBursts", () => {
  it("marks big drops and climbs, never the first stop or small moves", () => {
    const bursts = comicBursts(evenStops([8, 8 - BIG_MOVE, 8, 9]));
    expect(bursts.map(({ id, mood }) => [id, mood])).toEqual([
      ["s1", "drop"],
      ["s2", "climb"],
    ]);
  });

  it("takes each mood's words in turn", () => {
    const bursts = comicBursts(evenStops([10, 0, 10, 0, 10, 0, 10, 0]));
    expect(bursts.filter(({ mood }) => mood === "drop").map(({ word }) => word)).toEqual([0, 1, 2, 0]);
    expect(bursts.filter(({ mood }) => mood === "climb").map(({ word }) => word)).toEqual([0, 1, 2]);
  });

  it("leaves out a burst a row cut halfway to a neighbour would split", () => {
    const tight = BURST_HALF_WIDTH * 2 - 1;
    expect(comicBursts(evenStops([10, -10], tight))).toEqual([]);
    expect(comicBursts(evenStops([10, -10], BURST_HALF_WIDTH * 2))).toHaveLength(1);
  });
});
