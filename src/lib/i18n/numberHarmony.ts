/**
 * Pure rule for which ending a round number takes in languages with vowel harmony, such as Turkish 1990'lar and 2020'ler.
 * The ending follows the last vowel of the number as it is read aloud, so 30 (otuz) takes the back form and 20 (yirmi)
 * the front one. Messages give a Back and a Front form, and languages without harmony give both the same words.
 */

export type NumberHarmony = "back" | "front";

const TEN = 10;
const HUNDRED = 100;
/** Tens whose spoken word ends on a back vowel: on, otuz, kırk, altmış and doksan. */
const BACK_TENS: ReadonlySet<number> = new Set([1, 3, 4, 6, 9]);

/** The harmony of a whole number of tens, such as 1990 or 40; a multiple of 100 ends on yüz or bin, both front. */
export function decadeHarmony(decade: number): NumberHarmony {
  if (decade % HUNDRED === 0) {
    return "front";
  }
  return BACK_TENS.has(Math.floor(decade / TEN) % TEN) ? "back" : "front";
}
