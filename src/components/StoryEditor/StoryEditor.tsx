/**
 * Client component where a user writes their story and asks for it to be read.
 * The story stays in React state until the user presses Generate, and is never stored or logged.
 * Editing the story cancels any request in flight and clears earlier results.
 */
"use client";

import { useState, type ChangeEvent, type ReactElement } from "react";
import { MAX_STORY_LENGTH, appendPrompt, getStoryStatus } from "@/lib/story/storyInput";
import { ExtractedEvents } from "./ExtractedEvents";
import { StoryPrompts } from "./StoryPrompts";
import { useExtraction } from "./useExtraction";

const INPUT_ID = "story";
const INPUT_ROWS = 12;
const NUMBER_LOCALE = "en-US";
const PLACEHOLDER = "I started university in 2015. I was really excited about it...";
const TOO_LONG_MESSAGE = "This story is over the limit. Please shorten it to continue.";
const LOADING_MESSAGE = "Reading your story...";

export function StoryEditor(): ReactElement {
  const [story, setStory] = useState("");
  const { state, extract, reset } = useExtraction();
  const storyStatus = getStoryStatus(story);
  const isLoading = state.status === "loading";

  function updateStory(nextStory: string): void {
    setStory(nextStory);
    reset();
  }

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={INPUT_ID} className="font-semibold">
        Your story
      </label>
      <textarea
        id={INPUT_ID}
        value={story}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateStory(event.target.value)}
        placeholder={PLACEHOLDER}
        rows={INPUT_ROWS}
        className="w-full rounded-lg border border-muted bg-background p-4 text-base"
      />
      <StoryPrompts onSelect={(prompt) => updateStory(appendPrompt(story, prompt))} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {story.trim().length.toLocaleString(NUMBER_LOCALE)} of{" "}
          {MAX_STORY_LENGTH.toLocaleString(NUMBER_LOCALE)} characters
        </p>
        <button
          type="button"
          disabled={storyStatus !== "ready" || isLoading}
          onClick={() => void extract(story)}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
        >
          {isLoading ? LOADING_MESSAGE : "Generate my ride"}
        </button>
      </div>
      <p className="text-sm text-muted">
        When you press Generate, your story is sent to Anthropic&apos;s Claude API to find the
        events in it. This app does not save your story.
      </p>
      <p role="status" className="text-sm">
        {storyStatus === "too_long" && TOO_LONG_MESSAGE}
        {state.status === "error" && state.message}
      </p>
      {state.status === "done" && <ExtractedEvents result={state.result} />}
    </div>
  );
}
