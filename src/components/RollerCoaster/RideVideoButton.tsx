/**
 * The "Make a ride video" button, with its progress bar, Cancel and result message.
 * Recording happens on the device in real time, so the page asks the user to keep it open while the bar fills.
 * The button is left out on browsers that cannot record video, and nothing is shared unless the user chooses to.
 */
"use client";

import { useRef, useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
import type { LifeEvent } from "@/lib/events/schema";
import type { Track } from "@/lib/track/types";
import { tuneFor } from "@/lib/music/themeTunes";
import type { SceneryKind } from "@/lib/scene/themes";
import { isNonStopOn } from "./useNonStop";
import { isMusicOn } from "./useRideMusic";
import { RideVideoError, canRecordVideo, recordRideVideo, shareRideVideo, type VideoOutcome } from "./recordRideVideo";

interface RideVideoButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  track: Track;
  title: string;
  events: readonly LifeEvent[];
  isMonochrome: boolean;
  /** The scenery the ride is drawn in, which picks the music, or null for the plain look. */
  sceneryKind: SceneryKind | null;
}

const PERCENT = 100;
/** What to say once the video is made, or null to say nothing. */
const OUTCOME_MESSAGES: Readonly<Record<VideoOutcome, MessageKey | null>> = {
  shared: null,
  cancelled: null,
  downloaded: "pictures.videoDownloaded",
};
const NO_MESSAGE = "";

export function RideVideoButton({ svg, track, title, events, isMonochrome, sceneryKind }: RideVideoButtonProps): ReactElement | null {
  const t = useT();
  const locale = useLocale();
  const [isSupported] = useState(canRecordVideo);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const cancel = useRef<AbortController | null>(null);

  async function record(): Promise<void> {
    if (svg.current === null) {
      return;
    }
    const controller = new AbortController();
    cancel.current = controller;
    setMessage(NO_MESSAGE);
    setProgress(0);
    try {
      const titles = new Map(events.map(({ id, title: eventTitle }) => [id, eventTitle]));
      const video = await recordRideVideo({ svg: svg.current, track, title, titles, isMonochrome, isNonStop: isNonStopOn(), music: isMusicOn() ? tuneFor(sceneryKind) : null, locale, onProgress: setProgress, signal: controller.signal });
      setProgress(null);
      const outcome = OUTCOME_MESSAGES[await shareRideVideo(video, title.trim() || t("ride.unnamedTitle"))];
      setMessage(outcome === null ? NO_MESSAGE : t(outcome));
    } catch (error) {
      setProgress(null);
      setMessage(error instanceof RideVideoError && error.reason === "cancelled" ? NO_MESSAGE : t("pictures.videoFailed"));
    } finally {
      cancel.current = null;
    }
  }

  if (!isSupported) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      {progress === null ? (
        <div>
          <button type="button" onClick={() => void record()} className={SECONDARY_BUTTON_CLASS}>
            {t("pictures.makeVideo")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{t("pictures.recordingNote")}</p>
          <progress aria-label={t("pictures.videoLabel")} max={PERCENT} value={Math.round(progress * PERCENT)} className="w-full accent-accent" />
          <div>
            <button type="button" onClick={() => cancel.current?.abort()} className={SECONDARY_BUTTON_CLASS}>
              {t("pictures.cancel")}
            </button>
          </div>
        </div>
      )}
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
