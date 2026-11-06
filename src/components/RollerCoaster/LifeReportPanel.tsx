/**
 * Short, playful report on the story, written by the AI or included with a sample life.
 * It is written once when the story is read, so it says so, because later edits are not included.
 * It is a bit of fun, not advice or an assessment.
 */
import type { ReactElement } from "react";
import type { LifeReport } from "@/lib/events/insights";

interface LifeReportPanelProps {
  report: LifeReport;
  isSample: boolean;
}

const AI_NOTE = "Written by AI when it read your story, so later edits are not included.";
const SAMPLE_NOTE = "Part of this made-up sample life.";

export function LifeReportPanel({ report, isSample }: LifeReportPanelProps): ReactElement {
  return (
    <section aria-label="Life report" className="flex flex-col gap-2 rounded-lg border-2 border-accent p-4">
      <h2 className="text-xl font-semibold">Your life report</h2>
      <p className="wrap-anywhere text-lg font-semibold">{report.headline}</p>
      <ul className="list-disc pl-5">
        {report.highlights.map((highlight) => (
          <li key={highlight} className="wrap-anywhere">
            {highlight}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{isSample ? SAMPLE_NOTE : AI_NOTE}</p>
    </section>
  );
}
