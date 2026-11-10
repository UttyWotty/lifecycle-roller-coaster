/**
 * Tests for building the two drawings of a ride together.
 * They confirm both drawings have the same width and that a shared year sits at the same x in both.
 * They also confirm each ride keeps its own rider and every one of its events, and both rails run to the same end.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import type { SharedRide } from "@/lib/share/sharedRide";
import { composeTogether } from "./composeTogether";

function rideOf(index: number, title = SAMPLE_LIVES[index].title): SharedRide {
  const life = SAMPLE_LIVES[index];
  return { title, style: life.rideStyle, theme: life.rideTheme, rider: life.rider, events: [...life.events], chapters: [...life.chapters] };
}

describe("composeTogether", () => {
  const pair = [rideOf(0), rideOf(1, "A much longer title that needs a wider drawing than the other one")] as const;

  it.each(["coaster", "loops"] as const)("draws both %s rides at one width with every event", (style) => {
    const { rides } = composeTogether(pair, style, "sunny");
    expect(rides[0].track.width).toBe(rides[1].track.width);
    expect(rides[0].track.stops).toHaveLength(pair[0].events.length);
    expect(rides[1].track.stops).toHaveLength(pair[1].events.length);
    expect(rides[1].scene?.rider).toBe(pair[1].rider);
  });

  it("puts a shared column at the same x in both drawings", () => {
    const { aligned, rides } = composeTogether(pair, "coaster", "sunny");
    for (const column of aligned.columns) {
      const [first, second] = column.entries;
      if (first !== null && second !== null) {
        expect(rides[0].track.stops[first].x).toBe(rides[1].track.stops[second].x);
      }
    }
  });

  it.each(["coaster", "loops"] as const)("runs both %s rails to the same end, even when one life stops early", (style) => {
    const early = { ...rideOf(0), events: rideOf(0).events.slice(0, 2) };
    const { rides } = composeTogether([early, rideOf(1)], style, "sunny");
    const ends = rides.map(({ track }) => track.profile.at(-1)?.x);
    expect(ends[0]).toBe(ends[1]);
    expect(ends[0]).toBeGreaterThan(rides[0].track.stops.at(-1)?.x ?? 0);
  });

  it("makes three or four drawings exactly the same width", () => {
    for (const count of [3, 4]) {
      const group = Array.from({ length: count }, (_, index) => rideOf(index, index === 2 ? "A much longer title for the third ride of all" : undefined));
      const { rides } = composeTogether(group, "loops", "sunny");
      expect(rides).toHaveLength(count);
      expect(new Set(rides.map(({ track }) => track.width)).size).toBe(1);
    }
  });
});
