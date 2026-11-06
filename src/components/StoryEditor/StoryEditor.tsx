/**
 * Writing stage where a user tells their story and asks for it to be read.
 * The story stays in React state until the user presses Generate, and is never stored or logged.
 * Users can skip AI and add events by hand, which sends nothing anywhere.
 */
"use client";

import type { ChangeEvent, ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { MAX_STORY_LENGTH, appendPrompt, getStoryStatus } from "@/lib/story/storyInput";
import { StoryPrompts } from "./StoryPrompts";
import { useExtraction } from "./useExtraction";

interface StoryEditorProps {
  story: string;
  hasEvents: boolean;
  onStoryChange: (story: string) => void;
  onExtracted: (result: ExtractionResult) => void;
  onReturnToEvents: () => void;
  onAddManually: () => void;
}

const INPUT_ID = "story";
const INPUT_ROWS = 12;
const NUMBER_LOCALE = "en-US";
const PLACEHOLDER = "I started university in 2015. I was really excited about it...";
const TOO_LONG_MESSAGE = "This story is over the limit. Please shorten it to continue.";
const LOADING_MESSAGE = "Reading your story...";
const REPLACE_WARNING = "Generating again replaces your current events and any changes to them.";

export function StoryEditor(props: StoryEditorProps): ReactElement {
  const { story, hasEvents, onStoryChange, onExtracted, onReturnToEvents, onAddManually } = props;
  const { state, extract, reset } = useExtraction();
  const storyStatus = getStoryStatus(story);
  const isLoading = state.status === "loading";

  function updateStory(nextStory: string): void {
    onStoryChange(nextStory);
    reset();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Tell your story</h1>
        <p>Write about the moments that shaped your life, in your own words and in any order.</p>
      </header>
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
            onClick={() => void extract(story, onExtracted)}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
          >
            {isLoading ? LOADING_MESSAGE : "Generate my ride"}
          </button>
        </div>
        {hasEvents && <p className="text-sm">{REPLACE_WARNING}</p>}
        <p className="text-sm text-muted">
          When you press Generate, your story is sent to Anthropic&apos;s Claude API to find the
          events in it. Nothing is sent before that, this app does not save your story, and it
          disappears when you leave the page.
        </p>
        <p role="status" className="text-sm">
          {storyStatus === "too_long" && TOO_LONG_MESSAGE}
          {state.status === "error" && state.message}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasEvents ? (
            <button type="button" onClick={onReturnToEvents} className={SECONDARY_BUTTON_CLASS}>
              Return to my events
            </button>
          ) : (
            <button type="button" onClick={onAddManually} className={SECONDARY_BUTTON_CLASS}>
              Skip AI and add events myself
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
