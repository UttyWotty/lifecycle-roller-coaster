/**
 * Tests for the link that carries two rides.
 * They confirm both rides survive a round trip and that the pair link follows the share-link privacy rules.
 * They also confirm a pair with a missing, broken or extra part reads back as nothing.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import type { SharedRideInput } from "@/lib/share/sharedRide";
import { decodeTogether, encodeTogether } from "./togetherLink";

function rideOf(index: number): SharedRideInput {
  const life = SAMPLE_LIVES[index];
  return { title: life.title, style: life.rideStyle, theme: life.rideTheme, rider: life.rider, events: life.events, chapters: life.chapters };
}

describe("encodeTogether and decodeTogether", () => {
  it("bring back both rides", () => {
    const pair = decodeTogether(`#${encodeTogether(rideOf(0), rideOf(1))}`);
    expect(pair?.a.title).toBe(SAMPLE_LIVES[0].title);
    expect(pair?.b.events.map(({ title }) => title)).toEqual(SAMPLE_LIVES[1].events.map(({ title }) => title));
  });

  it("never carry descriptions", () => {
    const secret = { ...rideOf(0), events: rideOf(0).events.map((event) => ({ ...event, description: "ZZSECRETZZ" })) };
    const fragment = encodeTogether(secret, rideOf(1));
    const pair = decodeTogether(fragment);
    expect(pair?.a.events.every(({ description }) => description === "")).toBe(true);
  });

  it("refuse anything that is not exactly two valid rides", () => {
    const good = encodeTogether(rideOf(0), rideOf(1));
    const [first, second] = good.split("&");
    for (const fragment of ["", "#", first, `${second}&${first}`, `${good}&c=1`, `${first}&b=broken`, "a=&b="]) {
      expect(decodeTogether(fragment)).toBeNull();
    }
  });
});
