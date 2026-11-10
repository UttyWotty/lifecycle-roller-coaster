/**
 * The welcome at the top of the landing page, with the two ways to start, in the visitor's language.
 * It renders in English on the server and switches once the browser knows the visitor's language.
 * It holds no user data.
 */
"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";

export function LandingIntro(): ReactElement {
  const t = useT();
  return (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("landing.title")}</h1>
        <p className="text-xl">{t("landing.tagline")}</p>
        <p className="text-muted">{t("landing.intro")}</p>
      </header>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/story"
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-8 py-3 text-lg font-semibold text-on-accent"
        >
          {t("landing.start")}
        </Link>
        <Link
          href="/sample"
          className="inline-flex min-h-11 items-center rounded-full border border-muted px-8 py-3 text-lg font-semibold"
        >
          {t("landing.trySample")}
        </Link>
      </div>
    </>
  );
}
