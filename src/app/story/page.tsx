/**
 * Page where a user writes their story and reviews their events.
 * It sets the page metadata and layout around the interactive flow.
 * All interactive behaviour lives in the RideFlow client component.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { RideFlow } from "@/components/RideFlow/RideFlow";

export const metadata: Metadata = {
  title: "Tell your story | Lifecycle Roller Coaster",
};

export default function StoryPage(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <RideFlow />
    </main>
  );
}
