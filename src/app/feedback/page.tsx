/**
 * Page where visitors send feedback and ideas about the app.
 * It sets the page metadata and layout around the feedback form.
 * Nothing about a visitor's ride or story is on this page or sent from it.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { FeedbackPage } from "@/components/Feedback/FeedbackPage";

export const metadata: Metadata = {
  title: "Send feedback | Lifecycle Roller Coaster",
};

export default function Feedback(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <FeedbackPage />
    </main>
  );
}
