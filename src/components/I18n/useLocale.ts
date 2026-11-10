/**
 * Browser state for the app's language: the visitor's saved choice, or the first browser language the app speaks.
 * Every component reading it sees the same value, and the server always renders English, so pages hydrate cleanly
 * and then switch. Reading or saving the choice never throws; blocked storage keeps it for this page only.
 */
"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, pickLocale, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";

const LANGUAGE_KEY = "lifecycle-roller-coaster:language";

const listeners = new Set<() => void>();
/** The choice for this page when storage cannot keep it, or null to read it from storage. */
let pageChoice: Locale | null = null;

function savedChoice(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

/** The language in use now, for code outside React. */
export function currentLocale(): Locale {
  return pageChoice ?? pickLocale(savedChoice(), navigator.languages ?? []);
}

export function setLocale(locale: Locale): void {
  pageChoice = locale;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, locale);
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, currentLocale, () => DEFAULT_LOCALE);
}

export type Translate = (key: MessageKey, values?: Readonly<Record<string, string | number>>) => string;

/** The message function for the language in use. */
export function useT(): Translate {
  const locale = useLocale();
  return (key, values = {}) => translate(locale, key, values);
}
