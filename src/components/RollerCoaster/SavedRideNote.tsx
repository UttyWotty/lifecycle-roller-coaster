/**
 * Note that the user's own ride is kept on this device, with a Start over control that deletes it.
 * Start over asks once inline before deleting, because a real reading cost money to make.
 * It holds only the open or closed state of that question; deleting is left to the parent.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";

interface SavedRideNoteProps {
  onStartOver: () => void;
}

export function SavedRideNote({ onStartOver }: SavedRideNoteProps): ReactElement {
  const [isConfirming, setIsConfirming] = useState(false);
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {isConfirming ? (
        <>
          <p>{t("myRides.confirmStartOver")}</p>
          <button type="button" onClick={onStartOver} className={SECONDARY_BUTTON_CLASS}>
            {t("myRides.yesStartOver")}
          </button>
          <button type="button" onClick={() => setIsConfirming(false)} className={SECONDARY_BUTTON_CLASS}>
            {t("myRides.keepRide")}
          </button>
        </>
      ) : (
        <>
          <p className="text-muted">{t("myRides.savedNote")}</p>
          <button type="button" onClick={() => setIsConfirming(true)} className={SECONDARY_BUTTON_CLASS}>
            {t("myRides.startOver")}
          </button>
        </>
      )}
    </div>
  );
}
