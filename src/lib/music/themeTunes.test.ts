/**
 * Tests for the theme music data and timing.
 * They confirm every theme family has its own tune, and every tune's patterns are well formed and fill the same loop.
 * They also confirm held steps lengthen a note, rests are silent, and every note is audible and inside its loop.
 */
import { describe, expect, it } from "vitest";
import { THEME_TUNES, loopSeconds, notesOf, tuneFor, type Tune } from "./themeTunes";

const TUNES = Object.entries(THEME_TUNES);
const LOWEST_AUDIBLE = 30;
const HIGHEST_PLEASANT = 5000;
const MELODY_STEPS = 32;
const BASS_STEPS = 8;

function steps(pattern: string): string[] {
  return pattern.trim().split(/\s+/);
}

describe("THEME_TUNES", () => {
  it("gives each theme family a different tune, and the plain look the city tune", () => {
    expect(new Set(TUNES.map(([, tune]) => tune.melody)).size).toBe(TUNES.length);
    expect(tuneFor(null)).toBe(THEME_TUNES.city);
    expect(tuneFor("space")).toBe(THEME_TUNES.space);
  });

  it.each(TUNES)("%s has well-formed patterns of the same length", (_, tune) => {
    expect(steps(tune.melody)).toHaveLength(MELODY_STEPS);
    expect(steps(tune.bass)).toHaveLength(BASS_STEPS);
    for (const step of [...steps(tune.melody), ...steps(tune.bass)]) {
      expect(step).toMatch(/^(-?\d+|-|\.)$/);
    }
  });

  it.each(TUNES)("%s plays only audible notes inside its loop", (_, tune) => {
    const loop = loopSeconds(tune);
    const notes = notesOf(tune);
    expect(notes.length).toBeGreaterThan(0);
    for (const note of notes) {
      expect(note.seconds).toBeGreaterThan(0);
      expect(note.start).toBeGreaterThanOrEqual(0);
      expect(note.start + note.seconds).toBeLessThanOrEqual(loop + 1e-9);
      expect(note.frequency).toBeGreaterThan(LOWEST_AUDIBLE);
      expect(note.frequency).toBeLessThan(HIGHEST_PLEASANT);
    }
  });
});

describe("notesOf", () => {
  const tune: Tune = { tempo: 60, root: 440, melody: "0 - . 12", bass: "0", melodyWave: "sine", bassWave: "sine" };

  it("holds a note across '-' steps and leaves rests silent", () => {
    const melody = notesOf(tune).filter(({ part }) => part === "melody");
    expect(melody.map(({ start }) => start)).toEqual([0, 1.5]);
    expect(melody[0].seconds).toBeCloseTo(0.9);
    expect(melody[1].frequency).toBeCloseTo(880);
  });

  it("puts the bass two octaves down, each step two beats long", () => {
    const [bass] = notesOf(tune).filter(({ part }) => part === "bass");
    expect(bass.frequency).toBeCloseTo(110);
    expect(bass.seconds).toBeCloseTo(1.8);
  });

  it("times one pass by the melody", () => {
    expect(loopSeconds(tune)).toBe(2);
    expect(loopSeconds(THEME_TUNES.city)).toBeCloseTo((16 * 60) / 112);
  });
});
