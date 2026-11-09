/**
 * Note that the user's own ride is kept on this device, with a Start over control that deletes it.
 * Start over asks once inline before deleting, because a real reading cost money to make.
 * It holds only the open or closed state of that question; deleting is left to the parent.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";

interface SavedRideNoteProps {
  onStartOver: () => void;
}

const SAVED_NOTE = "Your ride is saved on this device only, so it is here when you come back. Your story text is not kept.";
const CONFIRM_QUESTION = "Delete this ride from this device and start a new one?";

export function SavedRideNote({ onStartOver }: SavedRideNoteProps): ReactElement {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {isConfirming ? (
        <>
          <p>{CONFIRM_QUESTION}</p>
          <button type="button" onClick={onStartOver} className={SECONDARY_BUTTON_CLASS}>
            Yes, start over
          </button>
          <button type="button" onClick={() => setIsConfirming(false)} className={SECONDARY_BUTTON_CLASS}>
            Keep my ride
          </button>
        </>
      ) : (
        <>
          <p className="text-muted">{SAVED_NOTE}</p>
          <button type="button" onClick={() => setIsConfirming(true)} className={SECONDARY_BUTTON_CLASS}>
            Start over
          </button>
        </>
      )}
    </div>
  );
}
