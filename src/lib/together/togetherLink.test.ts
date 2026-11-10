/**
 * Tests for the link that carries two to four rides.
 * They confirm every ride survives a round trip and that the link follows the share-link privacy rules.
 * They also confirm a link with too few or too many rides, keys out of order, or a broken part reads back as nothing.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import type { SharedRideInput } from "@/lib/share/sharedRide";
import { MAX_TOGETHER_RIDES, decodeTogether, encodeTogether } from "./togetherLink";

function rideOf(index: number): SharedRideInput {
  const life = SAMPLE_LIVES[index % SAMPLE_LIVES.length];
  return { title: life.title, style: life.rideStyle, theme: life.rideTheme, rider: life.rider, events: life.events, chapters: life.chapters };
}

describe("encodeTogether and decodeTogether", () => {
  it("bring back both rides of a pair", () => {
    const rides = decodeTogether(`#${encodeTogether([rideOf(0), rideOf(1)])}`);
    expect(rides?.[0].title).toBe(SAMPLE_LIVES[0].title);
    expect(rides?.[1].events.map(({ title }) => title)).toEqual(SAMPLE_LIVES[1].events.map(({ title }) => title));
  });

  it("bring back a group of four, in order", () => {
    const rides = decodeTogether(encodeTogether([0, 1, 2, 3].map(rideOf)));
    expect(rides?.map(({ title }) => title)).toEqual([0, 1, 2, 3].map((index) => rideOf(index).title));
  });

  it("keep at most four rides", () => {
    expect(encodeTogether([0, 1, 2, 3, 4].map(rideOf)).split("&")).toHaveLength(MAX_TOGETHER_RIDES);
  });

  it("never carry descriptions", () => {
    const secret = { ...rideOf(0), events: rideOf(0).events.map((event) => ({ ...event, description: "ZZSECRETZZ" })) };
    const rides = decodeTogether(encodeTogether([secret, rideOf(1)]));
    expect(rides?.[0].events.every(({ description }) => description === "")).toBe(true);
  });

  it("refuse anything that is not two to four valid rides with keys in order", () => {
    const good = encodeTogether([rideOf(0), rideOf(1), rideOf(2)]);
    const [first, second, third] = good.split("&");
    const payload = third.slice(2);
    for (const fragment of [
      "", "#", first, `${second}&${first}`, `${first}&${second}&d=${payload}`, `${first}&${second}&${third}&d=${payload}&e=${payload}`,
      `${first}&b=broken`, "a=&b=", `${first}&${second}&c=`, `${first}&a=${payload}`,
    ]) {
      expect(decodeTogether(fragment)).toBeNull();
    }
  });
});
