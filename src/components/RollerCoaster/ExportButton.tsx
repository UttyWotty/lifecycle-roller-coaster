/**
 * Button that downloads the ride as an image.
 * It stays disabled while an export runs, and explains any failure.
 * The image is created on the user's device, and nothing is shared unless they choose to.
 */
"use client";

import { useState, type ReactElement, type RefObject } from "react";
import { downloadRideImage } from "./downloadRideImage";

interface ExportButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
}

const FAILURE_MESSAGE = "We could not create your image. Please try again.";
const PRIVACY_NOTE = "The image is created on your device and is never uploaded.";

export function ExportButton({ svg, width, height }: ExportButtonProps): ReactElement {
  const [isExporting, setIsExporting] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  async function handleExport(): Promise<void> {
    if (svg.current === null) {
      return;
    }
    setIsExporting(true);
    setHasFailed(false);
    try {
      await downloadRideImage(svg.current, { width, height });
    } catch {
      setHasFailed(true);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isExporting}
        onClick={() => void handleExport()}
        className="min-h-11 self-start rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50"
      >
        Download image
      </button>
      <p className="text-sm text-muted">{PRIVACY_NOTE}</p>
      <p role="status" className="text-sm">
        {hasFailed && FAILURE_MESSAGE}
      </p>
    </div>
  );
}
