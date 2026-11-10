/**
 * Buttons that download the ride as a wide image, or share it as a portrait story picture with a link to the ride.
 * They stay disabled while an image is being made, and explain the result.
 * The image is created on the user's device, and nothing is shared unless they choose to.
 */
"use client";

import { useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { SHARED_RIDE_PATH } from "@/components/Share/ShareLinkPanel";
import { encodeSharedRide, type SharedRideInput } from "@/lib/share/sharedRide";
import { shareMessage } from "@/lib/share/shareTargets";
import { downloadRideImage, shareImageFile, type ShareOutcome } from "./downloadRideImage";
import { STORY_FILE_NAME, createStoryImage, type StoryPicture } from "./storyImage";

interface ExportButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  story: StoryPicture;
  /** The ride as its share link carries it, matching the drawing on screen. */
  shareRide: SharedRideInput;
}

const FAILURE_MESSAGE = "We could not create your image. Please try again.";
const PRIVACY_NOTE =
  "The image is created on your device. Nothing is shared unless you choose to. Share my ride sends a story-sized picture with a link to this ride; descriptions, the life report and your story are never in it.";
const SHARE_MESSAGES: Readonly<Record<ShareOutcome, string>> = {
  shared: "",
  cancelled: "",
  copied: "Image copied. Paste it anywhere to share your ride.",
  downloaded: "Sharing is not available here, so your image was downloaded instead.",
};

export function ExportButton({ svg, width, height, story, shareRide }: ExportButtonProps): ReactElement {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: (element: SVGSVGElement) => Promise<string>): Promise<void> {
    if (svg.current === null) {
      return;
    }
    setIsExporting(true);
    setMessage("");
    try {
      setMessage(await action(svg.current));
    } catch {
      setMessage(FAILURE_MESSAGE);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownload(element: SVGSVGElement): Promise<string> {
    await downloadRideImage(element, { width, height });
    return "";
  }

  async function handleShare(element: SVGSVGElement): Promise<string> {
    const picture = await createStoryImage(element, story);
    const link = `${window.location.origin}${SHARED_RIDE_PATH}#${encodeSharedRide(shareRide)}`;
    const message = shareMessage(shareRide.title);
    const outcome = await shareImageFile(picture, STORY_FILE_NAME, {
      title: shareRide.title.trim() || message,
      text: `${message} ${link}`,
    });
    return SHARE_MESSAGES[outcome];
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isExporting}
          onClick={() => void run(handleDownload)}
          className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
        >
          Download image
        </button>
        <button
          type="button"
          disabled={isExporting}
          onClick={() => void run(handleShare)}
          className={SECONDARY_BUTTON_CLASS}
        >
          Share my ride
        </button>
      </div>
      <p className="text-sm text-muted">{PRIVACY_NOTE}</p>
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
