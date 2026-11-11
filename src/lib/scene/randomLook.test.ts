/**
 * Tests for the surprise look picker behind the Random ride button.
 * They drive it with fixed random numbers, so every case is repeatable.
 * They check that the theme always changes, scenery-free themes are skipped and empty lists are refused.
 */
import { describe, expect, it } from "vitest";
import { RIDE_STYLES } from "@/lib/track/types";
import { NoSurpriseLookError, pickSurpriseLook, type RideLook } from "./randomLook";
import { RIDERS } from "./riders";
import { RIDE_THEMES } from "./themes";

const ALL = { styles: RIDE_STYLES, themes: RIDE_THEMES, riders: RIDERS };
const CURRENT: RideLook = { style: "coaster", theme: "classic", rider: "smiley" };
const LAST = 0.999999;

describe("pickSurpriseLook", () => {
  it("never returns the current theme or the plain theme, whatever the random number", () => {
    for (let step = 0; step < 100; step += 1) {
      const value = step / 100;
      const look = pickSurpriseLook(CURRENT, ALL, () => value);
      expect(look.theme).not.toBe(CURRENT.theme);
      expect(look.theme).not.toBe("plain");
    }
  });

  it("can reach every other scenery theme", () => {
    const seen = new Set<string>();
    for (let step = 0; step < 1000; step += 1) {
      seen.add(pickSurpriseLook(CURRENT, ALL, () => step / 1000).theme);
    }
    const expected = RIDE_THEMES.filter((theme) => theme !== "classic" && theme !== "plain");
    expect([...seen].sort()).toEqual([...expected].sort());
  });

  it("picks styles and riders across their whole lists", () => {
    expect(pickSurpriseLook(CURRENT, ALL, () => 0)).toMatchObject({ style: RIDE_STYLES[0], rider: RIDERS[0] });
    expect(pickSurpriseLook(CURRENT, ALL, () => LAST)).toMatchObject({
      style: RIDE_STYLES[RIDE_STYLES.length - 1],
      rider: RIDERS[RIDERS.length - 1],
    });
  });

  it("refuses when only the current theme is on offer", () => {
    const choices = { ...ALL, themes: ["classic", "plain"] as const };
    expect(() => pickSurpriseLook(CURRENT, choices, () => 0)).toThrow(NoSurpriseLookError);
  });
});
