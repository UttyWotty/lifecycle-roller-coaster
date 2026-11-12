/**
 * Tests for the Track map look's spec sheet.
 * They confirm the facts come from the stops: years spanned, count, highest, lowest and the number of big moves.
 * They also confirm cells sit only under stops with room, in order of importance, and long titles are shortened.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import { CELL_HALF_WIDTH, VALUE_MAX_LENGTH, specCells, specValues } from "./specSheet";

function stop(id: string, x: number, level: number, date: string | null, title = id): TrackStop {
  return { id, x, y: 0, level, title, date, category: "career", sentiment: "positive", impact: 5, isMajor: false, labelSide: "above" };
}

const ROOMY = CELL_HALF_WIDTH * 2;

describe("specValues", () => {
  it("reads the facts from the stops", () => {
    const values = specValues([stop("a", 0, 2, "2015"), stop("b", 1, -8, "2020-03"), stop("c", 2, 9, null), stop("d", 3, 9, "2012")]);
    expect(values).toEqual({ years: "2012–2020", stops: "4", highest: "c", lowest: "b", bigMoves: "2" });
  });

  it("gives one year when every date is in it, and none without dates", () => {
    expect(specValues([stop("a", 0, 1, "2019-01"), stop("b", 1, 2, "2019-12")]).years).toBe("2019");
    expect(specValues([stop("a", 0, 1, null)]).years).toBeNull();
  });

  it("shortens long titles", () => {
    const long = "A very long title for a stop";
    const highest = specValues([stop("a", 0, 5, null, long)]).highest ?? "";
    expect(highest.length).toBe(VALUE_MAX_LENGTH);
    expect(highest.endsWith("…")).toBe(true);
  });
});

describe("specCells", () => {
  it("puts the most important facts first, each under a stop", () => {
    const stops = [0, 1, 2, 3, 4].map((index) => stop(`s${index}`, (index + 1) * ROOMY, index, `${2010 + index}`));
    const cells = specCells(stops);
    expect(cells.map(({ fact }) => fact)).toEqual(["years", "stops", "highest", "lowest", "bigMoves"]);
    expect(cells.map(({ x }) => x)).toEqual(stops.map(({ x }) => x));
  });

  it("skips stops without room and has fewer cells than facts when stops are few", () => {
    const stops = [stop("a", ROOMY, 0, "2010"), stop("b", ROOMY + 10, 1, "2011"), stop("c", ROOMY * 3, 2, "2012")];
    const cells = specCells(stops);
    expect(cells.map(({ x }) => x)).toEqual([ROOMY * 3]);
    expect(cells[0].fact).toBe("years");
  });
});
