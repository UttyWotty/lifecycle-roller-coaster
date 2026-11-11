/**
 * Tests the River trip layout against real rides built from the sample lives.
 * They confirm splashes, spray and lily pads never land on a stop in any coaster style.
 * They use the same composeRide path the page uses, with no mocks.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import { composeRide } from "./composeRide";
import { lilyPads, rapidRuns, reedSpots, splashes, spraySpots } from "./riverLayout";

const CLEAR = 30;

describe("river layout on real tracks", () => {
  for (const life of SAMPLE_LIVES) {
    for (const style of ["coaster", "loops"] as const) {
      it(`keeps details off stops: ${life.id} ${style}`, () => {
        const { track } = composeRide(life.events, { style, theme: "river", title: "t" });
        const runs = rapidRuns(track.profile);
        const near = (p: { x: number; y: number }) =>
          track.stops.some((s) => Math.hypot(s.x - p.x, s.y - p.y) < CLEAR);
        expect(splashes(runs, track.stops).filter(near)).toEqual([]);
        expect(spraySpots(runs, track.stops).filter(near)).toEqual([]);
        const pads = lilyPads(track.profile, track.stops);
        expect(pads.filter(near)).toEqual([]);
        expect(reedSpots(pads, track.stops).filter(near)).toEqual([]);
      });
    }
  }
});
