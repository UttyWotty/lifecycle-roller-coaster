/**
 * Pure rules for Guess my ride, where a friend guesses each stop of a shared ride before it is revealed.
 * For every stop they guess how it felt and how big it was, earn a point for each right answer, and get a playful verdict.
 * It also says where the curtain over the unrevealed track begins, so the drawing never gives an answer away.
 */
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
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

export const FEELING_CHOICES: readonly { value: EventSentiment; name: string }[] = [
  { value: "positive", name: "Good" },
  { value: "negative", name: "Hard" },
  { value: "neutral", name: "In between" },
];

export const SIZE_CHOICES: readonly { value: StopSize; name: string; range: string }[] = [
  { value: "small", name: "Small", range: "1 to 3" },
  { value: "medium", name: "Medium", range: "4 to 6" },
  { value: "big", name: "Big", range: "7 to 10" },
];

/** Highest impact that still counts as small, and as medium. */
const SMALL_UP_TO = 3;
const MEDIUM_UP_TO = 6;
export const POINTS_PER_STOP = 2;
const DRAWING_LEFT = 0;
/** Past the widest stop marker (15) with a little room, before the rail starts to bend. */
const CURTAIN_GAP = 22;
/** Shares of the best score that earn each verdict, from the top. */
const VERDICTS: readonly { from: number; text: string }[] = [
  { from: 0.9, text: "You could have built this ride yourself." },
  { from: 0.7, text: "You know this ride really well." },
  { from: 0.4, text: "You know the big moments." },
  { from: 0, text: "Plenty of surprises on this ride." },
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

export function verdict(score: number, best: number): string {
  const share = best > 0 ? score / best : 0;
  return (VERDICTS.find(({ from }) => share >= from) ?? VERDICTS[VERDICTS.length - 1]).text;
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

/** The message shared with a score, which carries the link so friends can take the same ride. */
export function scoreMessage(title: string, score: number, best: number, link: string): string {
  const name = title.trim() === "" ? "this ride" : `"${title.trim()}"`;
  return `I scored ${score}/${best} guessing ${name}. Can you beat me? ${link}`;
}
