/**
 * Pure choice of which sample life to show next.
 * It takes the random number as an argument, so the choice can be tested exactly.
 * It never repeats the sample on screen, so each click shows something new.
 */
import { SAMPLE_LIVES, type SampleLife } from "./sampleLives";

/** Picks from the samples other than the current one, using a random number from 0 up to 1. */
export function pickSample(currentId: string | null, random: number): SampleLife {
  const choices = SAMPLE_LIVES.filter(({ id }) => id !== currentId);
  return choices[Math.floor(random * choices.length)];
}
