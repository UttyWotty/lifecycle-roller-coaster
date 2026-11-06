/**
 * Row of example prompts that help a user start writing.
 * Choosing a prompt reports it to the parent, which adds it to the story.
 * The component holds no state of its own.
 */
import type { ReactElement } from "react";
import { STORY_PROMPTS } from "@/lib/story/storyInput";

interface StoryPromptsProps {
  onSelect: (prompt: string) => void;
}

export function StoryPrompts({ onSelect }: StoryPromptsProps): ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {STORY_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="min-h-11 rounded-full border border-muted px-4 py-2 text-sm"
        >
          {prompt}...
        </button>
      ))}
    </div>
  );
}
