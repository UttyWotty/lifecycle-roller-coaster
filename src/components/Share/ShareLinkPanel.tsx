/**
 * Opt-in panel that turns the ride on screen into a link, with one-tap buttons for social apps.
 * The whole ride is packed into the part of the link after "#", which browsers never send to a server.
 * It says plainly what the link contains, and builds the link only while the user has the panel open.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { embedCode } from "@/lib/share/embedCode";
import { encodeSharedRide, type SharedRideInput } from "@/lib/share/sharedRide";
import { shareMessage, shareTargets } from "@/lib/share/shareTargets";

interface ShareLinkPanelProps {
  ride: SharedRideInput;
}

export const SHARED_RIDE_PATH = "/ride";
const CONTENTS_NOTE =
  "Anyone with the link can see this ride: event titles, dates, how each felt and mattered, chapter names and the title. Descriptions, the life report and your story are never included, and the ride lives only in the link.";
const COPIED = "Link copied. Paste it anywhere to share your ride.";
const EMBED_COPIED = "Embed code copied. Paste it into your website or blog's HTML to show your ride there.";
const COPY_FAILED = "Copying is blocked here. Select the link above and copy it.";

function canUseShareSheet(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function ShareLinkPanel({ ride }: ShareLinkPanelProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const message = shareMessage(ride.title);
  /** Rebuilt from the ride on screen every time, so later edits, lenses and titles are always in the link. */
  const fragment = isOpen ? encodeSharedRide(ride) : null;
  const link = fragment === null ? null : `${window.location.origin}${SHARED_RIDE_PATH}#${fragment}`;

  function open(): void {
    setIsOpen(true);
    setStatus("");
  }

  async function copy(text: string, copied: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(copied);
    } catch {
      setStatus(COPY_FAILED);
    }
  }

  async function shareSheet(url: string): Promise<void> {
    try {
      await navigator.share({ title: ride.title || message, text: message, url });
    } catch {
      setStatus("");
    }
  }

  if (link === null || fragment === null) {
    return (
      <div>
        <button type="button" onClick={open} className={SECONDARY_BUTTON_CLASS}>
          Share a link
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Share a link" className="flex flex-col gap-3 rounded-lg border border-muted p-4">
      <h2 className="font-semibold">Share a link to your ride</h2>
      <p className="text-sm">{CONTENTS_NOTE}</p>
      <input
        readOnly
        value={link}
        aria-label="Link to your ride"
        onFocus={(event) => event.target.select()}
        className="min-h-11 w-full rounded-lg border border-muted bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {canUseShareSheet() && (
          <button
            type="button"
            onClick={() => void shareSheet(link)}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
          >
            Share...
          </button>
        )}
        <button type="button" onClick={() => void copy(link, COPIED)} className={SECONDARY_BUTTON_CLASS}>
          Copy link
        </button>
        <button
          type="button"
          onClick={() => void copy(embedCode(window.location.origin, fragment, ride.title), EMBED_COPIED)}
          className={SECONDARY_BUTTON_CLASS}
        >
          Copy embed code
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
        <button type="button" onClick={() => setIsOpen(false)} className={SECONDARY_BUTTON_CLASS}>
          Close
        </button>
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
    </section>
  );
}
