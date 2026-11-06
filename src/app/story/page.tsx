/**
 * Story page where a user writes their life story in free-form text.
 * It frames the editor with a short introduction and a privacy note.
 * All interactive behaviour lives in the StoryEditor client component.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { StoryEditor } from "@/components/StoryEditor/StoryEditor";

export const metadata: Metadata = {
  title: "Tell your story | Lifecycle Roller Coaster",
};

export default function StoryPage(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Tell your story</h1>
        <p>Write about the moments that shaped your life, in your own words and in any order.</p>
      </header>
      <StoryEditor />
      <p className="text-sm text-muted">
        Your story stays in this browser tab and disappears when you leave the page.
      </p>
    </main>
  );
}
