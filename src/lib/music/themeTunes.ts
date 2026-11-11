/**
 * Pure data and timing for the theme music: one short original tune per scenery kind, written as step patterns.
 * A pattern is a row of steps where a number starts a note that many semitones above the tune's root, "-" holds it, and "." rests.
 * It turns a tune into notes with start times, lengths and frequencies, so the browser player only has to play them.
 */
import type { SceneryKind } from "@/lib/scene/themes";

export type Wave = "sine" | "triangle" | "square" | "sawtooth";

export interface Tune {
  /** Beats per minute. */
  tempo: number;
  /** The note that semitone 0 stands for, in hertz. */
  root: number;
  /** Melody steps, two per beat. */
  melody: string;
  /** Bass steps, one per two beats, played two octaves below the root. */
  bass: string;
  melodyWave: Wave;
  bassWave: Wave;
}

export interface TuneNote {
  /** Seconds from the start of the loop. */
  start: number;
  seconds: number;
  frequency: number;
  part: "melody" | "bass";
}

const SECONDS_PER_MINUTE = 60;
const MELODY_STEPS_PER_BEAT = 2;
/** Each bass step lasts two beats, so its eight steps span the melody's sixteen beats. */
const BASS_STEPS_PER_BEAT = 0.5;
const SEMITONES_PER_OCTAVE = 12;
const OCTAVE = 2;
/** The bass plays two octaves below the root. */
const BASS_OCTAVES_DOWN = 2;
const HOLD = "-";
const REST = ".";
/** Notes are cut a little short of their full length, so repeated notes stay distinct. */
const NOTE_LENGTH_SHARE = 0.9;

/** Original tunes, one per scenery kind; the plain look shares the city tune. */
export const THEME_TUNES: Readonly<Record<SceneryKind, Tune>> = {
  city: {
    tempo: 112, root: 523.25, melodyWave: "triangle", bassWave: "sine",
    melody: "0 . 4 . 7 - 4 . 5 . 9 . 7 - - . 4 . 7 . 12 - 11 . 9 . 7 . 4 - - .",
    bass: "0 . 7 . 5 . 7 .",
  },
  fairground: {
    tempo: 132, root: 587.33, melodyWave: "square", bassWave: "triangle",
    melody: "7 . 7 4 7 . 12 . 11 . 9 . 7 - - . 5 . 5 2 5 . 11 . 9 . 7 . 4 - - .",
    bass: "0 7 7 . 5 7 7 .",
  },
  haunted: {
    tempo: 84, root: 440, melodyWave: "triangle", bassWave: "sine",
    melody: "0 - 3 - 7 - 6 - 3 - - - . . . . 0 - 3 - 8 - 7 - 3 - 2 - 0 - - -",
    bass: "0 . 0 . 1 . 0 .",
  },
  toy: {
    tempo: 120, root: 1046.5, melodyWave: "sine", bassWave: "triangle",
    melody: "0 4 7 12 7 4 0 . 2 5 9 14 9 5 2 . 4 7 11 16 11 7 4 . 0 4 7 12 - - - .",
    bass: "0 . 5 . 7 . 0 .",
  },
  neon: {
    tempo: 120, root: 440, melodyWave: "sawtooth", bassWave: "square",
    melody: "0 . 0 3 . 3 7 . 5 . 5 3 . 3 2 . 0 . 0 3 . 3 10 . 8 . 7 . 3 - - .",
    bass: "0 0 . 0 8 8 . 7",
  },
  line: {
    tempo: 90, root: 659.25, melodyWave: "sine", bassWave: "sine",
    melody: "0 - . . 7 - . . 4 - . . 2 - - - 0 - . . 9 - . . 7 - . . 4 - - -",
    bass: "0 . . . 5 . . .",
  },
  poster: {
    tempo: 126, root: 523.25, melodyWave: "square", bassWave: "triangle",
    melody: "0 . 2 4 . 7 . 4 5 . 4 2 . 0 - . 0 . 2 4 . 9 . 7 5 . 4 2 . 0 - .",
    bass: "0 7 5 7 0 7 5 4",
  },
  space: {
    tempo: 72, root: 392, melodyWave: "sine", bassWave: "sine",
    melody: "0 - - - 7 - - - 14 - - - 12 - - - 0 - - - 5 - - - 9 - - - 7 - - -",
    bass: "0 - - - 5 - - -",
  },
  ocean: {
    tempo: 96, root: 493.88, melodyWave: "triangle", bassWave: "sine",
    melody: "0 . 4 7 - . 4 . 2 . 5 9 - . 5 . 4 . 7 11 - . 7 . 5 . 4 2 - - . .",
    bass: "0 . 5 . 7 . 5 .",
  },
  mountain: {
    tempo: 104, root: 587.33, melodyWave: "triangle", bassWave: "triangle",
    melody: "0 . 2 . 4 . 7 - 9 . 7 . 4 . 2 - 0 . 2 . 4 . 9 - 7 . 4 . 2 . 0 -",
    bass: "0 . 7 . 0 . 7 .",
  },
  garden: {
    tempo: 92, root: 523.25, melodyWave: "triangle", bassWave: "sine",
    melody: "0 . 4 . 7 . 9 - 7 . 4 . 5 - . . 4 . 7 . 12 . 11 - 9 . 7 . 4 - . .",
    bass: "0 . 5 . 0 . 7 .",
  },
  constellation: {
    tempo: 66, root: 783.99, melodyWave: "sine", bassWave: "sine",
    melody: "0 - 7 - 12 - 7 - 5 - 4 - 2 - - - 0 - 4 - 9 - 7 - 5 - 4 - 0 - - -",
    bass: "0 - 5 - 3 - 7 -",
  },
  arcade: {
    tempo: 150, root: 659.25, melodyWave: "square", bassWave: "square",
    melody: "0 7 12 7 0 7 12 7 3 8 15 8 3 8 15 8 5 10 17 10 5 10 17 10 7 . 12 . 7 . . .",
    bass: "0 0 8 8 5 5 7 7",
  },
};

/** The tune for a scenery kind, or the city tune for the plain look without scenery. */
export function tuneFor(kind: SceneryKind | null): Tune {
  return THEME_TUNES[kind ?? "city"];
}

function frequencyOf(root: number, semitones: number): number {
  return root * OCTAVE ** (semitones / SEMITONES_PER_OCTAVE);
}

/** The notes of one pattern, with each held step added to the note before it. */
function patternNotes(pattern: string, stepSeconds: number, root: number, part: TuneNote["part"]): TuneNote[] {
  const notes: TuneNote[] = [];
  let open: { start: number; steps: number; semitones: number } | null = null;
  const close = (): void => {
    if (open !== null) {
      notes.push({ start: open.start, seconds: open.steps * stepSeconds * NOTE_LENGTH_SHARE, frequency: frequencyOf(root, open.semitones), part });
      open = null;
    }
  };
  pattern.trim().split(/\s+/).forEach((step, index) => {
    if (step === HOLD && open !== null) {
      open.steps += 1;
      return;
    }
    close();
    if (step !== REST && step !== HOLD) {
      open = { start: index * stepSeconds, steps: 1, semitones: Number(step) };
    }
  });
  close();
  return notes;
}

/** How long one pass of a tune lasts, set by its melody. */
export function loopSeconds(tune: Tune): number {
  const beats = tune.melody.trim().split(/\s+/).length / MELODY_STEPS_PER_BEAT;
  return (beats * SECONDS_PER_MINUTE) / tune.tempo;
}

/** Every note of one pass of a tune, melody and bass, in seconds from the start of the pass. */
export function notesOf(tune: Tune): TuneNote[] {
  const beatSeconds = SECONDS_PER_MINUTE / tune.tempo;
  const bassRoot = tune.root / OCTAVE ** BASS_OCTAVES_DOWN;
  return [
    ...patternNotes(tune.melody, beatSeconds / MELODY_STEPS_PER_BEAT, tune.root, "melody"),
    ...patternNotes(tune.bass, beatSeconds / BASS_STEPS_PER_BEAT, bassRoot, "bass"),
  ].sort((a, b) => a.start - b.start);
}
