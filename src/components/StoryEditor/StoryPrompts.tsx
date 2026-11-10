/**
 * Row of example prompts that help a user start writing, in the visitor's language.
 * Choosing a prompt reports its words to the parent, which adds them to the story.
 * The component holds no state of its own.
 */
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
import { STORY_PROMPTS, type StoryPromptId } from "@/lib/story/storyInput";

interface StoryPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPT_KEYS: Readonly<Record<StoryPromptId, MessageKey>> = {
  university: "story.promptUniversity",
  firstJob: "story.promptFirstJob",
  hardest: "story.promptHardest",
  movedTo: "story.promptMovedTo",
  neverForget: "story.promptNeverForget",
};

export function StoryPrompts({ onSelect }: StoryPromptsProps): ReactElement {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {STORY_PROMPTS.map((id) => {
        const prompt = t(PROMPT_KEYS[id]);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(prompt)}
            className="min-h-11 rounded-full border border-muted px-4 py-2 text-sm"
          >
            {t("story.promptButton", { prompt })}
          </button>
        );
      })}
    </div>
  );
}
