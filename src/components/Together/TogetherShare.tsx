/**
 * Share buttons for a ride together, using the link that is already open.
 * Both rides live in the part of the link after "#", so sharing it shares exactly what is on screen and nothing more.
 * It says plainly what the link contains before anything is shared.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { shareTargets } from "@/lib/share/shareTargets";

interface TogetherShareProps {
  names: readonly [string, string];
}

const NOTE =
  "Anyone with this link can see both rides: event titles, dates, how each felt and mattered, chapter names and titles. Descriptions and stories are never in it.";

export function TogetherShare({ names }: TogetherShareProps): ReactElement {
  const [status, setStatus] = useState("");
  const link = window.location.href;
  const message = `Take a ride through "${names[0]}" and "${names[1]}" together.`;

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Link copied. Paste it anywhere to share this ride together.");
    } catch {
      setStatus("Copying is blocked here. Copy the address from your browser instead.");
    }
  }

  return (
    <section aria-label="Share this ride together" className="flex flex-col gap-2 rounded-lg border border-muted p-4">
      <h2 className="font-semibold">Share this ride together</h2>
      <p className="text-sm">{NOTE}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className={SECONDARY_BUTTON_CLASS}>
          Copy link
        </button>
        {shareTargets(link, message).map((target) => (
          <a
            key={target.name}
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${SECONDARY_BUTTON_CLASS} inline-flex items-center`}
          >
            {target.name}
          </a>
        ))}
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
    </section>
  );
}
