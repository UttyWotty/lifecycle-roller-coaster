/**
 * Writing stage where a user tells their story and asks for it to be read.
 * The story stays in React state until the user presses Generate, and is never stored or logged.
 * Users can skip AI and add events by hand, which sends nothing anywhere; every word follows the visitor's language.
 */
"use client";

import type { ChangeEvent, ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { ExtractionResult } from "@/lib/ai/extraction";
import { NUMBER_LOCALES } from "@/lib/i18n/locales";
import { MAX_STORY_LENGTH, appendPrompt, getStoryStatus } from "@/lib/story/storyInput";
import { StoryPrompts } from "./StoryPrompts";
import { useExtraction } from "./useExtraction";

interface StoryEditorProps {
  story: string;
  hasEvents: boolean;
  isSample: boolean;
  onStoryChange: (story: string) => void;
  onExtracted: (result: ExtractionResult) => void;
  onReturnToEvents: () => void;
  onAddManually: () => void;
  onShowSample: () => void;
}

const INPUT_ID = "story";
const INPUT_ROWS = 12;

export function StoryEditor(props: StoryEditorProps): ReactElement {
  const { story, hasEvents, isSample, onStoryChange, onExtracted, onReturnToEvents, onAddManually, onShowSample } = props;
  const { state, extract, reset } = useExtraction();
  const t = useT();
  const numberLocale = NUMBER_LOCALES[useLocale()];
  const storyStatus = getStoryStatus(story);
  const isLoading = state.status === "loading";
  /** Hidden once a real ride exists, so a paid reading can never be replaced by accident. */
  const canShowSample = !hasEvents || isSample;

  function updateStory(nextStory: string): void {
    onStoryChange(nextStory);
    reset();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t("story.heading")}</h1>
        <p>{t("story.intro")}</p>
        {canShowSample && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onShowSample} className={SECONDARY_BUTTON_CLASS}>
              {t("story.trySample")}
            </button>
            <p className="text-sm text-muted">{t("story.sampleHint")}</p>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-4">
        <label htmlFor={INPUT_ID} className="font-semibold">
          {t("story.storyLabel")}
        </label>
        <textarea
          id={INPUT_ID}
          value={story}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateStory(event.target.value)}
          placeholder={t("story.placeholder")}
          rows={INPUT_ROWS}
          className="w-full rounded-lg border border-muted bg-background p-4 text-base"
        />
        <StoryPrompts onSelect={(prompt) => updateStory(appendPrompt(story, prompt))} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {t("story.characterCount", {
              count: story.trim().length.toLocaleString(numberLocale),
              max: MAX_STORY_LENGTH.toLocaleString(numberLocale),
            })}
          </p>
          <button
            type="button"
            disabled={storyStatus !== "ready" || isLoading}
            onClick={() => void extract(story, onExtracted)}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
          >
            {isLoading ? t("story.loading") : t("story.generate")}
          </button>
        </div>
        {hasEvents && <p className="text-sm">{t("story.replaceWarning")}</p>}
        <p className="text-sm text-muted">{t("story.privacyNote")}</p>
        <p role="status" className="text-sm">
          {storyStatus === "too_long" && t("story.tooLong")}
          {state.status === "error" && t(state.messageKey)}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasEvents ? (
            <button type="button" onClick={onReturnToEvents} className={SECONDARY_BUTTON_CLASS}>
              {t("story.returnToRide")}
            </button>
          ) : (
            <button type="button" onClick={onAddManually} className={SECONDARY_BUTTON_CLASS}>
              {t("story.addManually")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
