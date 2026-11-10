/**
 * Tests for the Guess my ride rules.
 * They confirm sizes, judging and scoring, the verdicts at each level, and the shared score message, in English and Turkish.
 * They also confirm the curtain always hides the stop being guessed and lifts fully after the last one.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import type { TrackStop } from "@/lib/track/types";
import { GUESS_STYLES, curtainFor, guessStyle, judgeGuess, scoreMessage, scoreOf, sizeOf, verdict } from "./guessGame";

function event(sentiment: LifeEvent["sentiment"], impact: number): LifeEvent {
  return { id: "e", date: "2020", title: "T", description: "", category: "career", sentiment, impact, confidence: 1 };
}

function stop(x: number): TrackStop {
  return {
    id: `s${x}`, x, y: 0, level: 1, title: "", date: null, category: "career",
    sentiment: "positive", impact: 5, isMajor: false, labelSide: "above",
  };
}

describe("sizes, judging and scoring", () => {
  it("puts impacts into small, medium and big", () => {
    expect([1, 3, 4, 6, 7, 10].map(sizeOf)).toEqual(["small", "small", "medium", "medium", "big", "big"]);
  });

  it("gives a point for the feeling and one for the size", () => {
    const results = [
      judgeGuess({ feeling: "positive", size: "big" }, event("positive", 9)),
      judgeGuess({ feeling: "negative", size: "big" }, event("positive", 5)),
      judgeGuess({ feeling: "neutral", size: "small" }, event("neutral", 8)),
    ];
    expect(results[0]).toEqual({ isFeelingRight: true, isSizeRight: true });
    expect(results[1]).toEqual({ isFeelingRight: false, isSizeRight: false });
    expect(scoreOf(results)).toBe(3);
  });

  it("gives a playful verdict at every level", () => {
    expect(verdict(10, 10)).toMatch(/built this ride yourself/);
    expect(verdict(7, 10)).toMatch(/really well/);
    expect(verdict(4, 10)).toMatch(/big moments/);
    expect(verdict(0, 10)).toMatch(/surprises/);
    expect(verdict(0, 0)).toMatch(/surprises/);
    expect(verdict(10, 10, "tr")).toBe("Bu treni kendin yapmış olabilirdin.");
  });

  it("shares the score with the ride's link", () => {
    expect(scoreMessage("Maya's ride", 9, 12, "https://x/ride#r=a")).toBe('I scored 9/12 guessing "Maya\'s ride". Can you beat me? https://x/ride#r=a');
    expect(scoreMessage(" ", 1, 2, "L")).toBe("I scored 1/2 guessing this ride. Can you beat me? L");
    expect(scoreMessage("Maya", 9, 12, "L", "tr")).toBe('"Maya" trenini tahmin ederek 9/12 puan aldım. Beni geçebilir misin? L');
  });
});

describe("curtainFor", () => {
  const stops = [stop(100), stop(300), stop(500)];

  it("covers the whole ride before the first reveal", () => {
    expect(curtainFor(stops, 0, false)).toEqual({ x: 0, after: null });
  });

  it("starts just past the last revealed stop, never on the way to the next one", () => {
    expect(curtainFor(stops, 1, false)).toEqual({ x: 122, after: stops[0] });
    expect(curtainFor(stops, 1, true)).toEqual({ x: 322, after: stops[1] });
  });

  it("lifts once the last stop is revealed", () => {
    expect(curtainFor(stops, 2, true)).toBeNull();
  });
});

describe("guessStyle", () => {
  it("plays a metro map as a coaster and keeps the other styles", () => {
    expect(guessStyle("metro")).toBe("coaster");
    expect(guessStyle("loops")).toBe("loops");
    expect(GUESS_STYLES).not.toContain("metro");
  });
});
