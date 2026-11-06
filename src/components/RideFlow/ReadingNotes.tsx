/**
 * Notes about how a story was read: the demo and sample notices and any clarification questions.
 * The ride and review stages both show them, because the review stage is optional.
 * The demo notice makes sure sample events are never mistaken for a real reading.
 */
import type { ReactElement } from "react";

interface ReadingNotesProps {
  isDemo: boolean;
  isSample: boolean;
  clarifications: readonly string[];
}

const SAMPLE_NOTICE = "This is a sample life. The person and the story are made up, and it cost nothing to make.";
const DEMO_TITLE = "Demo mode: these are sample events, not your story";
const DEMO_DETAILS =
  "The AI did not read what you wrote. To have it read your story, add an API key to .env, set EXTRACTOR_MODE=anthropic and restart the app.";

export function ReadingNotes({ isDemo, isSample, clarifications }: ReadingNotesProps): ReactElement {
  return (
    <>
      {isSample && <p className="rounded-lg border border-muted p-4 text-sm">{SAMPLE_NOTICE}</p>}
      {isDemo && (
        <div role="alert" className="flex flex-col gap-1 rounded-lg border-2 border-accent p-4">
          <h2 className="font-semibold">{DEMO_TITLE}</h2>
          <p className="text-sm">{DEMO_DETAILS}</p>
        </div>
      )}
      {clarifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">A few questions</h2>
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
