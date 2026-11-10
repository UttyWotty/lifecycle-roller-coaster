/**
 * Pure rules for the app's languages: which ones exist, which one a visitor gets, and filling words into a message.
 * A visitor's own choice wins; otherwise the first browser language the app speaks; otherwise English.
 * It reads no browser state itself, so the browser adapter passes in what it found.
 */

export const LOCALES = ["en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Each language named in its own language, for the picker. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = { en: "English", tr: "Türkçe" };

/** The BCP 47 tag each language formats numbers with, such as 20,000 in English and 20.000 in Turkish. */
export const NUMBER_LOCALES: Readonly<Record<Locale, string>> = { en: "en-US", tr: "tr-TR" };

const LANGUAGE_SEPARATOR = "-";
const PLACEHOLDER = /\{(\w+)\}/g;

export function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

/** The language to show: the saved choice, else the first browser language the app speaks, else English. */
export function pickLocale(saved: string | null, browserLanguages: readonly string[]): Locale {
  if (isLocale(saved)) {
    return saved;
  }
  for (const language of browserLanguages) {
    const base = language.toLowerCase().split(LANGUAGE_SEPARATOR)[0];
    if (isLocale(base)) {
      return base;
    }
  }
  return DEFAULT_LOCALE;
}

/** Puts values into a message's {placeholders}; a placeholder without a value is left as it is. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(PLACEHOLDER, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
