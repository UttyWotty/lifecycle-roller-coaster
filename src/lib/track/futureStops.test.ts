/**
 * Tests for future stops.
 * They confirm dates count as future at their own precision, and only the run of future stops at the end is the future.
 * They also confirm the rail is cut exactly halfway to the first stop to come, so the cart parks on the rail.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import { buildLoopTrack, buildTrack } from "./buildTrack";
import { buildMetroMap } from "./buildMetroMap";
import { addFuture, futureFromIndex, isFutureDate, pastStops, splitFuture, todayString } from "./futureStops";

const TODAY = "2026-11-10";

function event(index: number, date: string | null, impact = 5): LifeEvent {
  return { id: `e${index}`, date, title: `Event ${index}`, description: "", category: "career", sentiment: "positive", impact, confidence: 1 };
}

const LIFE = [event(0, "2015"), event(1, "2020"), event(2, "2026"), event(3, "2027", 9), event(4, "2030-05")];

describe("isFutureDate", () => {
  it("compares at the date's own precision", () => {
    expect(isFutureDate("2026", TODAY)).toBe(false);
    expect(isFutureDate("2027", TODAY)).toBe(true);
    expect(isFutureDate("2026-11", TODAY)).toBe(false);
    expect(isFutureDate("2026-12", TODAY)).toBe(true);
    expect(isFutureDate("2026-11-10", TODAY)).toBe(false);
    expect(isFutureDate("2026-11-11", TODAY)).toBe(true);
    expect(isFutureDate(null, TODAY)).toBe(false);
  });

  it("writes today in the user's own calendar", () => {
    expect(todayString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("futureFromIndex and splitFuture", () => {
  it("finds the run of future stops at the end", () => {
    expect(futureFromIndex(LIFE, TODAY)).toBe(3);
    expect(futureFromIndex(LIFE.slice(0, 3), TODAY)).toBeNull();
    expect(futureFromIndex([event(0, "2030"), event(1, "2031")], TODAY)).toBe(0);
  });

  it("does not treat a future date followed by a past one as the future", () => {
    expect(futureFromIndex([event(0, "2030"), event(1, "2015")], TODAY)).toBeNull();
  });

  it("splits events into what happened and what is to come", () => {
    const { past, future } = splitFuture(LIFE, TODAY);
    expect(past.map(({ id }) => id)).toEqual(["e0", "e1", "e2"]);
    expect(future.map(({ id }) => id)).toEqual(["e3", "e4"]);
  });
});

describe("addFuture", () => {
  it.each([["coaster", buildTrack], ["loops", buildLoopTrack]] as const)("cuts the %s rail halfway to the first stop to come", (_, build) => {
    const track = addFuture(build(LIFE), LIFE, TODAY);
    const [before, after] = [track.stops[2], track.stops[3]];
    expect(track.future?.fromIndex).toBe(3);
    expect(track.future?.x).toBeCloseTo((before.x + after.x) / 2);
    expect(track.future?.pastRail?.startsWith("M")).toBe(true);
    expect(pastStops(track)).toHaveLength(3);
  });

  it("parks the cart on the rail's own curve", () => {
    const track = addFuture(buildTrack(LIFE), LIFE, TODAY);
    const park = track.future?.parkAt;
    const profilePoint = track.profile.reduce((best, point) =>
      Math.abs(point.x - (park?.x ?? 0)) < Math.abs(best.x - (park?.x ?? 0)) ? point : best,
    );
    expect(Math.abs((park?.y ?? 0) - profilePoint.y)).toBeLessThan(6);
  });

  it("leaves a ride with nothing to come unchanged, and works without a rail", () => {
    expect(addFuture(buildTrack(LIFE.slice(0, 3)), LIFE.slice(0, 3), TODAY).future).toBeNull();
    const metro = addFuture(buildMetroMap(LIFE), LIFE, TODAY);
    expect(metro.future?.pastRail).toBeNull();
    expect(metro.future?.x).toBeCloseTo((metro.stops[2].x + metro.stops[3].x) / 2);
  });
});
