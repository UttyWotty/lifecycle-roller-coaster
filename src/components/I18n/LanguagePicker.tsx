/**
 * The language picker in the site footer, listing each language in its own words.
 * Choosing one is remembered on this device and changes every page at once.
 * It also keeps the page's lang attribute in step, so screen readers pronounce the words correctly.
 */
"use client";

import { useEffect, type ReactElement } from "react";
import { LOCALES, LOCALE_NAMES, isLocale } from "@/lib/i18n/locales";
import { setLocale, useLocale, useT } from "./useLocale";

export function LanguagePicker(): ReactElement {
  const locale = useLocale();
  const t = useT();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <label className="flex items-center gap-2 text-sm">
      {t("common.languageLabel")}
      <select
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) {
            setLocale(event.target.value);
          }
        }}
        className="min-h-11 rounded-lg border border-muted bg-background px-2"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option} lang={option}>
            {LOCALE_NAMES[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
