/**
 * Share buttons for a ride together, using the link that is already open.
 * Every ride lives in the part of the link after "#", so sharing it shares exactly what is on screen and nothing more.
 * It says plainly what the link contains before anything is shared.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { shareTargets } from "@/lib/share/shareTargets";
import { namesInWords } from "@/lib/together/names";

interface TogetherShareProps {
  names: readonly string[];
}

const NO_STATUS = "";

export function TogetherShare({ names }: TogetherShareProps): ReactElement {
  const t = useT();
  const locale = useLocale();
  const [status, setStatus] = useState(NO_STATUS);
  const link = window.location.href;
  const message = t("together.shareMessage", { names: namesInWords(names.map((name) => `"${name}"`), locale) });

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      setStatus(t("together.linkCopied"));
    } catch {
      setStatus(t("together.copyFailed"));
    }
  }

  return (
    <section aria-label={t("together.shareHeading")} className="flex flex-col gap-2 rounded-lg border border-muted p-4">
      <h2 className="font-semibold">{t("together.shareHeading")}</h2>
      <p className="text-sm">{t("together.shareNote")}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className={SECONDARY_BUTTON_CLASS}>
          {t("share.copyLink")}
        </button>
        {shareTargets(link, message, locale).map((target) => (
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
