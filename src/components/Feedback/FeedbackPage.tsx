/**
 * The feedback page's content: its heading, a one-line invitation and the form.
 * It is a client component so the words follow the chosen language, like the rest of the app.
 * The page file around it only sets the metadata and layout.
 */
"use client";

import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import { FeedbackForm } from "./FeedbackForm";

export function FeedbackPage(): ReactElement {
  const t = useT();
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("feedback.pageTitle")}</h1>
      <p className="text-lg">{t("feedback.intro")}</p>
      <FeedbackForm />
    </section>
  );
}
