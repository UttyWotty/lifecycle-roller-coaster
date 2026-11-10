/**
 * Notes about how a story was read: the demo and sample notices and any clarification questions.
 * The ride and review stages both show them, because the review stage is optional.
 * The demo notice makes sure sample events are never mistaken for a real reading; the questions are the AI's own words.
 */
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";

interface ReadingNotesProps {
  isDemo: boolean;
  isSample: boolean;
  clarifications: readonly string[];
}

export function ReadingNotes({ isDemo, isSample, clarifications }: ReadingNotesProps): ReactElement {
  const t = useT();
  return (
    <>
      {isSample && <p className="rounded-lg border border-muted p-4 text-sm">{t("review.sampleNotice")}</p>}
      {isDemo && (
        <div role="alert" className="flex flex-col gap-1 rounded-lg border-2 border-accent p-4">
          <h2 className="font-semibold">{t("review.demoTitle")}</h2>
          <p className="text-sm">{t("review.demoDetails")}</p>
        </div>
      )}
      {clarifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">{t("review.questionsHeading")}</h2>
          <ul className="list-disc pl-5 text-sm">
            {clarifications.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
