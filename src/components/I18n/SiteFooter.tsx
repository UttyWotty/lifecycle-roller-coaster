/**
 * The footer on every page: a short privacy line, a link to send feedback, and the language picker.
 * It is the one place the language is chosen, so it sits outside each page's own content.
 * It is left out of the embed page, which sits inside other sites, and holds no user data.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { LanguagePicker } from "./LanguagePicker";
import { useT } from "./useLocale";

/** The page shown inside other sites, which stays compact. */
const EMBED_PATH = "/embed";

export function SiteFooter(): ReactElement | null {
  const t = useT();
  if (usePathname() === EMBED_PATH) {
    return null;
  }
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-muted">
      <p className="text-sm">{t("common.footerPrivacy")}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/feedback" className="text-sm font-semibold text-accent underline underline-offset-2">
          {t("feedback.footerLink")}
        </Link>
        <LanguagePicker />
      </div>
    </footer>
  );
}
