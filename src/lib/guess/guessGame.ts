/**
 * Pure rules for Guess my ride, where a friend guesses each stop of a shared ride before it is revealed.
 * For every stop they guess how it felt and how big it was, earn a point for each right answer, and get a playful verdict.
 * It also says where the curtain over the unrevealed track begins, so the drawing never gives an answer away.
 */
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { RIDE_STYLES, type RideStyle, type TrackStop } from "@/lib/track/types";

export type StopSize = "small" | "medium" | "big";

export interface Guess {
  feeling: EventSentiment;
  size: StopSize;
}

export interface GuessResult {
  isFeelingRight: boolean;
  isSizeRight: boolean;
}

/** The feelings a player picks from, in the order the buttons show them; components name them in the chosen language. */
export const FEELING_CHOICES: readonly EventSentiment[] = ["positive", "negative", "neutral"];

/** The sizes a player picks from, smallest first; components name them with their impact ranges. */
export const SIZE_CHOICES: readonly StopSize[] = ["small", "medium", "big"];

/** Highest impact that still counts as small, and as medium. */
const SMALL_UP_TO = 3;
const MEDIUM_UP_TO = 6;
export const POINTS_PER_STOP = 2;
const DRAWING_LEFT = 0;
/** Past the widest stop marker (15) with a little room, before the rail starts to bend. */
const CURTAIN_GAP = 22;
/** Shares of the best score that earn each verdict, from the top. */
const VERDICTS: readonly { from: number; key: MessageKey }[] = [
  { from: 0.9, key: "guess.verdictTop" },
  { from: 0.7, key: "guess.verdictHigh" },
  { from: 0.4, key: "guess.verdictMiddle" },
  { from: 0, key: "guess.verdictLow" },
];

export function sizeOf(impact: number): StopSize {
  if (impact <= SMALL_UP_TO) {
    return "small";
  }
  return impact <= MEDIUM_UP_TO ? "medium" : "big";
}

export function judgeGuess(guess: Guess, event: LifeEvent): GuessResult {
  return { isFeelingRight: guess.feeling === event.sentiment, isSizeRight: guess.size === sizeOf(event.impact) };
}

export function scoreOf(results: readonly GuessResult[]): number {
  return results.reduce((total, { isFeelingRight, isSizeRight }) => total + Number(isFeelingRight) + Number(isSizeRight), 0);
}

/** The playful verdict for a score, in the given language (English, DEFAULT_LOCALE, unless one is passed). */
export function verdict(score: number, best: number, locale: Locale = DEFAULT_LOCALE): string {
  const share = best > 0 ? score / best : 0;
  return translate(locale, (VERDICTS.find(({ from }) => share >= from) ?? VERDICTS[VERDICTS.length - 1]).key);
}

/** Where the curtain over the unrevealed track begins, and the revealed stop it starts just after. */
export interface Curtain {
  x: number;
  /** The last revealed stop, whose label stays visible through the curtain, or null before the first reveal. */
  after: TrackStop | null;
}

/**
 * The curtain starts just past the last revealed stop's marker, where the rail is still level, so the climb or drop
 * toward the stop being guessed never shows. Before the first reveal it covers the whole ride; once the last stop is
 * revealed it lifts (null).
 */
export function curtainFor(stops: readonly TrackStop[], index: number, isRevealed: boolean): Curtain | null {
  const shown = isRevealed ? index : index - 1;
  if (stops[shown + 1] === undefined) {
    return null;
  }
  const after = stops[shown] ?? null;
  return { x: after === null ? DRAWING_LEFT : after.x + CURTAIN_GAP, after };
}

/**
 * Styles a game can be played in. Metro lines bend toward a station right after the one before it, so the curtain
 * cannot hide whether a big stop is coming; games switch a metro map to the coaster.
 */
export const GUESS_STYLES: readonly RideStyle[] = RIDE_STYLES.filter((style) => style !== "metro");
const GUESS_FALLBACK_STYLE: RideStyle = "coaster";

/** The style a game is drawn in: the chosen one when a game can hide its answers, otherwise the coaster. */
export function guessStyle(style: RideStyle): RideStyle {
  return GUESS_STYLES.includes(style) ? style : GUESS_FALLBACK_STYLE;
}

/** The message shared with a score, which carries the link so friends can take the same ride; English unless a locale is passed. */
export function scoreMessage(title: string, score: number, best: number, link: string, locale: Locale = DEFAULT_LOCALE): string {
  const trimmed = title.trim();
  const values = { title: trimmed, score, best, link };
  return translate(locale, trimmed === "" ? "guess.scoreUntitled" : "guess.scoreTitled", values);
}
