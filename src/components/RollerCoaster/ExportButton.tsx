/**
 * Buttons that download the ride as an image, or share it.
 * They stay disabled while an image is being made, and explain the result.
 * The image is created on the user's device, and nothing is shared unless they choose to.
 */
"use client";

import { useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { downloadRideImage, shareRideImage, type ShareOutcome } from "./downloadRideImage";

interface ExportButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
}

const FAILURE_MESSAGE = "We could not create your image. Please try again.";
const PRIVACY_NOTE = "The image is created on your device. Nothing is shared unless you choose to.";
const SHARE_MESSAGES: Readonly<Record<ShareOutcome, string>> = {
  shared: "",
  cancelled: "",
  copied: "Image copied. Paste it anywhere to share your ride.",
  downloaded: "Sharing is not available here, so your image was downloaded instead.",
};

export function ExportButton({ svg, width, height }: ExportButtonProps): ReactElement {
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
    return SHARE_MESSAGES[await shareRideImage(element, { width, height })];
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
