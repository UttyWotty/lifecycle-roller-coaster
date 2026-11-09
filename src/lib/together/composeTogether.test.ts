/**
 * Tests for building the two drawings of a ride together.
 * They confirm both drawings have the same width and that a shared year sits at the same x in both.
 * They also confirm each ride keeps its own rider and every one of its events.
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
      if (column.a !== null && column.b !== null) {
        expect(rides[0].track.stops[column.a].x).toBe(rides[1].track.stops[column.b].x);
      }
    }
  });
});
