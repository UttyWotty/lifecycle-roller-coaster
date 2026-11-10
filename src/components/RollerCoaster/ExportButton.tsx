/**
 * Buttons that download the ride as a wide image or an A3 poster, or share it as a portrait story picture with a link to the ride.
 * They stay disabled while an image is being made, and explain the result.
 * The image is created on the user's device, and nothing is shared unless they choose to.
 */
"use client";

import { useState, type ReactElement, type RefObject } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { SHARED_RIDE_PATH } from "@/components/Share/ShareLinkPanel";
import type { MessageKey } from "@/lib/i18n/messages";
import { encodeSharedRide, type SharedRideInput } from "@/lib/share/sharedRide";
import { shareMessage } from "@/lib/share/shareTargets";
import { POSTER_FILE_NAME } from "@/lib/export/poster";
import { downloadRideImage, saveFile, shareImageFile, type ShareOutcome } from "./downloadRideImage";
import { createPosterImage } from "./posterImage";
import { STORY_FILE_NAME, createStoryImage, type StoryPicture } from "./storyImage";

interface ExportButtonProps {
  svg: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  story: StoryPicture;
  /** The ride as its share link carries it, matching the drawing on screen. */
  shareRide: SharedRideInput;
}

/** What to say after sharing, or null to say nothing. */
const SHARE_MESSAGES: Readonly<Record<ShareOutcome, MessageKey | null>> = {
  shared: null,
  cancelled: null,
  copied: "pictures.imageCopied",
  downloaded: "pictures.imageDownloaded",
};
const NO_MESSAGE = "";

export function ExportButton({ svg, width, height, story, shareRide }: ExportButtonProps): ReactElement {
  const t = useT();
  const locale = useLocale();
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
      setMessage(t("pictures.imageFailed"));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownload(element: SVGSVGElement): Promise<string> {
    await downloadRideImage(element, { width, height });
    return NO_MESSAGE;
  }

  async function handlePoster(element: SVGSVGElement): Promise<string> {
    saveFile(await createPosterImage(element, story, locale), POSTER_FILE_NAME);
    return t("pictures.posterSaved");
  }

  async function handleShare(element: SVGSVGElement): Promise<string> {
    const picture = await createStoryImage(element, story, locale);
    const link = `${window.location.origin}${SHARED_RIDE_PATH}#${encodeSharedRide(shareRide)}`;
    const message = shareMessage(shareRide.title, locale);
    const outcome = await shareImageFile(picture, STORY_FILE_NAME, {
      title: shareRide.title.trim() || message,
      text: `${message} ${link}`,
    });
    const key = SHARE_MESSAGES[outcome];
    return key === null ? NO_MESSAGE : t(key);
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
          {t("pictures.downloadImage")}
        </button>
        <button
          type="button"
          disabled={isExporting}
          onClick={() => void run(handleShare)}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("pictures.shareRide")}
        </button>
        <button
          type="button"
          disabled={isExporting}
          onClick={() => void run(handlePoster)}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("pictures.downloadPoster")}
        </button>
      </div>
      <p className="text-sm text-muted">{t("pictures.privacyNote")}</p>
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
