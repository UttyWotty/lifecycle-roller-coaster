/**
 * Tests for the vowel harmony rule of round numbers.
 * They confirm decades and ages take the ending their spoken last vowel calls for, as in 1990'lar and 2020'ler.
 * They also confirm hundreds and thousands, which end on yüz or bin, take the front ending.
 */
import { describe, expect, it } from "vitest";
import { decadeHarmony } from "./numberHarmony";

describe("decadeHarmony", () => {
  it("follows the last spoken vowel of the tens", () => {
    expect([10, 30, 40, 60, 90].map(decadeHarmony)).toEqual(["back", "back", "back", "back", "back"]);
    expect([20, 50, 70, 80].map(decadeHarmony)).toEqual(["front", "front", "front", "front"]);
    expect(decadeHarmony(1990)).toBe("back");
    expect(decadeHarmony(2010)).toBe("back");
    expect(decadeHarmony(2020)).toBe("front");
  });

  it("gives hundreds and thousands the front ending", () => {
    expect([100, 1900, 2000].map(decadeHarmony)).toEqual(["front", "front", "front"]);
    expect(decadeHarmony(110)).toBe("back");
  });
});
