/**
 * Pure wording for naming the people in a ride together.
 * It joins names the way people say them, with commas and a final "and".
 * It is shared by the together page and its share message.
 */

const PAIR = 2;

/** "A", "A and B", or "A, B and C". */
export function namesInWords(names: readonly string[]): string {
  return names.length < PAIR ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
