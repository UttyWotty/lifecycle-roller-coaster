/**
 * Strip of every theme on the landing page, so visitors see the range before they start.
 * Each one leads to a sample life, where the theme can be tried for free.
 * The strip is static and holds no user data.
 */
"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import { ThemePreview } from "@/components/Scene/ThemePreview";
import { RIDE_THEMES } from "@/lib/scene/themes";

export function ThemeGallery(): ReactElement {
  const t = useT();
  return (
    <section aria-label={t("landing.themesLabel")} className="flex w-full flex-col gap-3">
      <h2 className="text-xl font-semibold">{t("landing.themesHeading")}</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {RIDE_THEMES.map((theme) => (
          <li key={theme}>
            <Link href="/sample" className="flex flex-col gap-1 text-sm font-semibold">
              <ThemePreview theme={theme} />
              {t(`look.${theme}Theme`)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
