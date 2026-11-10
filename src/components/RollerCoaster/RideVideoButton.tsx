/**
 * The "Make a ride video" button, with its progress bar, Cancel and result message.
 * Recording happens on the device in real time, so the page asks the user to keep it open while the bar fills.
 * The button is left out on browsers that cannot record video, and nothing is shared unless the user chooses to.
 */
"use client";

import { useRef, useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import type { LifeEvent } from "@/lib/events/schema";
import type { Track } from "@/lib/track/types";
import { isNonStopOn } from "./useNonStop";
import { RideVideoError, canRecordVideo, recordRideVideo, shareRideVideo, type VideoOutcome } from "./recordRideVideo";

interface RideVideoButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  track: Track;
  title: string;
  events: readonly LifeEvent[];
  isMonochrome: boolean;
}

const PERCENT = 100;
const RECORDING_NOTE = "Recording your ride video. Keep this page open until it is done.";
const FAILED = "We could not make your video. Please try again.";
const OUTCOME_MESSAGES: Readonly<Record<VideoOutcome, string>> = {
  shared: "",
  cancelled: "",
  downloaded: "Your video was downloaded.",
};
const SHARE_TITLE = "My Life Roller Coaster";

export function RideVideoButton({ svg, track, title, events, isMonochrome }: RideVideoButtonProps): ReactElement | null {
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
    setMessage("");
    setProgress(0);
    try {
      const titles = new Map(events.map(({ id, title: eventTitle }) => [id, eventTitle]));
      const video = await recordRideVideo({ svg: svg.current, track, title, titles, isMonochrome, isNonStop: isNonStopOn(), onProgress: setProgress, signal: controller.signal });
      setProgress(null);
      setMessage(OUTCOME_MESSAGES[await shareRideVideo(video, title.trim() || SHARE_TITLE)]);
    } catch (error) {
      setProgress(null);
      setMessage(error instanceof RideVideoError && error.reason === "cancelled" ? "" : FAILED);
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
            Make a ride video
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{RECORDING_NOTE}</p>
          <progress aria-label="Ride video" max={PERCENT} value={Math.round(progress * PERCENT)} className="w-full accent-accent" />
          <div>
            <button type="button" onClick={() => cancel.current?.abort()} className={SECONDARY_BUTTON_CLASS}>
              Cancel
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
