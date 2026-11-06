/**
 * Tests for the pure story input rules.
 * They cover empty, boundary and over-limit stories.
 * They also confirm that adding a prompt never loses existing text.
 */
import { describe, expect, it } from "vitest";
import { MAX_STORY_LENGTH, STORY_PROMPTS, appendPrompt, getStoryStatus } from "./storyInput";

describe("getStoryStatus", () => {
  it.each(["", "   ", "\n\t \n"])("treats %j as empty", (story) => {
    expect(getStoryStatus(story)).toBe("empty");
  });

  it("accepts a normal story", () => {
    expect(getStoryStatus("I started university in 2015.")).toBe("ready");
  });

  it("accepts a story at exactly the limit", () => {
    expect(getStoryStatus("a".repeat(MAX_STORY_LENGTH))).toBe("ready");
  });

  it("rejects a story one character over the limit", () => {
    expect(getStoryStatus("a".repeat(MAX_STORY_LENGTH + 1))).toBe("too_long");
  });

  it("does not count surrounding whitespace toward the limit", () => {
    expect(getStoryStatus(`  ${"a".repeat(MAX_STORY_LENGTH)}  \n`)).toBe("ready");
  });
});

describe("appendPrompt", () => {
  const prompt = STORY_PROMPTS[0];

  it("starts an empty story with the prompt", () => {
    expect(appendPrompt("", prompt)).toBe(`${prompt} `);
  });

  it("treats a blank story as empty", () => {
    expect(appendPrompt("  \n ", prompt)).toBe(`${prompt} `);
  });

  it("keeps existing text and adds the prompt on a new line", () => {
    expect(appendPrompt("I was born in 1990.", prompt)).toBe(`I was born in 1990.\n${prompt} `);
  });

  it("does not stack blank lines after existing text", () => {
    expect(appendPrompt("I was born in 1990.\n\n", prompt)).toBe(`I was born in 1990.\n${prompt} `);
  });
});
