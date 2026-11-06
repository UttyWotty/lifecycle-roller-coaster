/**
 * Client component where a user writes their life story and adds example prompts.
 * The story lives only in React state, so it is never stored, logged or sent anywhere.
 * Generate validates the story and reports that extraction has not been connected yet.
 */
"use client";

import { useState, type ChangeEvent, type ReactElement } from "react";
import {
  MAX_STORY_LENGTH,
  STORY_PROMPTS,
  appendPrompt,
  getStoryStatus,
} from "@/lib/story/storyInput";

const INPUT_ID = "story";
const PLACEHOLDER = "I started university in 2015. I was really excited about it...";
const TOO_LONG_MESSAGE = "This story is over the limit. Please shorten it to continue.";
const NOT_CONNECTED_MESSAGE =
  "Your story looks great. AI extraction is not connected yet, so nothing was sent.";

export function StoryEditor(): ReactElement {
  const [story, setStory] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const status = getStoryStatus(story);

  function updateStory(nextStory: string): void {
    setStory(nextStory);
    setHasGenerated(false);
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    updateStory(event.target.value);
  }

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={INPUT_ID} className="font-semibold">
        Your story
      </label>
      <textarea
        id={INPUT_ID}
        value={story}
        onChange={handleChange}
        placeholder={PLACEHOLDER}
        rows={12}
        className="w-full rounded-lg border border-muted bg-background p-4 text-base"
      />
      <div className="flex flex-wrap gap-2">
        {STORY_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => updateStory(appendPrompt(story, prompt))}
            className="min-h-11 rounded-full border border-muted px-4 py-2 text-sm"
          >
            {prompt}...
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {story.trim().length.toLocaleString("en-US")} of{" "}
          {MAX_STORY_LENGTH.toLocaleString("en-US")} characters
        </p>
        <button
          type="button"
          disabled={status !== "ready"}
          onClick={() => setHasGenerated(true)}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
        >
          Generate my ride
        </button>
      </div>
      <p role="status" className="text-sm">
        {status === "too_long" && TOO_LONG_MESSAGE}
        {status === "ready" && hasGenerated && NOT_CONNECTED_MESSAGE}
      </p>
    </div>
  );
}
