/**
 * Pure rules for the free-text story a user writes before event extraction.
 * It decides whether a story can be submitted and adds example prompts to it.
 * This module holds no state and performs no I/O, so story text never leaves the caller.
 */

/** Upper bound on story length, chosen to fit a long life story and keep LLM requests affordable. */
export const MAX_STORY_LENGTH = 20_000;

/** The example prompts offered, by id; the interface looks up each one's words in the visitor's language. */
export const STORY_PROMPTS = ["university", "firstJob", "hardest", "movedTo", "neverForget"] as const;

export type StoryPromptId = (typeof STORY_PROMPTS)[number];

export type StoryStatus = "empty" | "too_long" | "ready";

const LINE_BREAK = "\n";
const PROMPT_TRAILING_SPACE = " ";

/** Classifies a story, counting surrounding whitespace toward neither state nor length. */
export function getStoryStatus(story: string): StoryStatus {
  const trimmed = story.trim();
  if (trimmed.length === 0) {
    return "empty";
  }
  return trimmed.length > MAX_STORY_LENGTH ? "too_long" : "ready";
}

/** Adds a prompt on a new line after the existing text, ready for the user to continue typing. */
export function appendPrompt(story: string, prompt: string): string {
  const existing = story.trimEnd();
  const separator = existing.length === 0 ? "" : LINE_BREAK;
  return `${existing}${separator}${prompt}${PROMPT_TRAILING_SPACE}`;
}
