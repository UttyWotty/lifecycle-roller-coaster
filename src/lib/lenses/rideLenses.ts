/**
 * Pure ride lenses: ways to turn one story into several rides by part of life, by decade or by age.
 * Each lens picks a subset of the events in their original order and carries a title ready for sharing.
 * A lens appears only when it has enough events to make a ride, and age lenses need the year the person was born;
 * names and titles are the lenses messages in the language asked for.
 */
import type { EventCategory, LifeEvent } from "@/lib/events/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { decadeHarmony, type NumberHarmony } from "@/lib/i18n/numberHarmony";

export const WHOLE_LIFE = "all";
/** A ride needs at least two stops to have any ups and downs. */
export const MIN_LENS_EVENTS = 2;
/** The age that splits a life into before and after. */
const TURNING_AGE = 30;
const DECADE = 10;
const TEENS = 10;
const OLDEST_AGE = 120;
const YEAR_DIGITS = 4;
const EARLIEST_BIRTH_YEAR = 1900;

export interface LensOption {
  id: string;
  /** Short name for the picker. */
  name: string;
  /** Title for the drawing when the user has not named the ride. */
  title: string;
}

interface Lens extends LensOption {
  includes: (event: LifeEvent, birthYear: number | null) => boolean;
}

interface LensWords {
  name: MessageKey;
  title: MessageKey;
}

/** Parts of life worth a ride of their own. "Other" is a catch-all, so it gets no lens. */
const PART_WORDS: Readonly<Partial<Record<EventCategory, LensWords>>> = {
  career: { name: "lenses.careerName", title: "lenses.careerTitle" },
  business: { name: "lenses.businessName", title: "lenses.businessTitle" },
  relationships: { name: "lenses.relationshipsName", title: "lenses.relationshipsTitle" },
  education: { name: "lenses.educationName", title: "lenses.educationTitle" },
  finance: { name: "lenses.financeName", title: "lenses.financeTitle" },
  health: { name: "lenses.healthName", title: "lenses.healthTitle" },
  personal: { name: "lenses.personalName", title: "lenses.personalTitle" },
};
const DECADE_WORDS: Readonly<Record<NumberHarmony, LensWords>> = {
  back: { name: "lenses.decadeNameBack", title: "lenses.decadeTitleBack" },
  front: { name: "lenses.decadeNameFront", title: "lenses.decadeTitleFront" },
};
const AGE_WORDS: Readonly<Record<NumberHarmony, LensWords>> = {
  back: { name: "lenses.ageNameBack", title: "lenses.ageTitleBack" },
  front: { name: "lenses.ageNameFront", title: "lenses.ageTitleFront" },
};
const TEENS_WORDS: LensWords = { name: "lenses.teensName", title: "lenses.teensTitle" };
const BEFORE_WORDS: LensWords = { name: "lenses.beforeName", title: "lenses.beforeTitle" };
const AFTER_WORDS: LensWords = { name: "lenses.afterName", title: "lenses.afterTitle" };

/** A lens's name and title in one language, with its number filled in. */
function wordsIn(locale: Locale, words: LensWords, values: Readonly<Record<string, number>> = {}): Pick<LensOption, "name" | "title"> {
  return { name: translate(locale, words.name, values), title: translate(locale, words.title, values) };
}

function eventYear(event: LifeEvent): number | null {
  return event.date === null ? null : Number(event.date.slice(0, YEAR_DIGITS));
}

function ageAt(event: LifeEvent, birthYear: number | null): number | null {
  const year = eventYear(event);
  return year === null || birthYear === null ? null : year - birthYear;
}

function partLenses(events: readonly LifeEvent[], locale: Locale): Lens[] {
  const categories = [...new Set(events.map((event) => event.category))];
  return categories.flatMap((category) => {
    const part = PART_WORDS[category];
    return part ? [{ id: `part:${category}`, ...wordsIn(locale, part), includes: (event: LifeEvent) => event.category === category }] : [];
  });
}

function decadeLenses(events: readonly LifeEvent[], locale: Locale): Lens[] {
  const decades = [...new Set(events.flatMap((event) => {
    const year = eventYear(event);
    return year === null ? [] : [Math.floor(year / DECADE) * DECADE];
  }))].sort((a, b) => a - b);
  return decades.map((decade) => ({
    id: `decade:${decade}`,
    ...wordsIn(locale, DECADE_WORDS[decadeHarmony(decade)], { decade }),
    includes: (event: LifeEvent) => {
      const year = eventYear(event);
      return year !== null && year >= decade && year < decade + DECADE;
    },
  }));
}

function ageLenses(events: readonly LifeEvent[], birthYear: number | null, locale: Locale): Lens[] {
  if (birthYear === null) {
    return [];
  }
  const ages = [...new Set(events.flatMap((event) => {
    const age = ageAt(event, birthYear);
    return age === null || age < TEENS ? [] : [Math.floor(age / DECADE) * DECADE];
  }))].sort((a, b) => a - b);
  const byDecade = ages.map((from): Lens => ({
    id: `age:${from}`,
    ...(from === TEENS ? wordsIn(locale, TEENS_WORDS) : wordsIn(locale, AGE_WORDS[decadeHarmony(from)], { age: from })),
    includes: (event, born) => {
      const age = ageAt(event, born);
      return age !== null && age >= from && age < from + DECADE;
    },
  }));
  const split: Lens[] = [
    {
      id: `before:${TURNING_AGE}`,
      ...wordsIn(locale, BEFORE_WORDS, { age: TURNING_AGE }),
      includes: (event, born) => {
        const age = ageAt(event, born);
        return age !== null && age < TURNING_AGE;
      },
    },
    {
      id: `after:${TURNING_AGE}`,
      ...wordsIn(locale, AFTER_WORDS, { age: TURNING_AGE }),
      includes: (event, born) => {
        const age = ageAt(event, born);
        return age !== null && age >= TURNING_AGE;
      },
    },
  ];
  return [...byDecade, ...split];
}

function allLenses(events: readonly LifeEvent[], birthYear: number | null, locale: Locale): Lens[] {
  const lenses = [...partLenses(events, locale), ...decadeLenses(events, locale), ...ageLenses(events, birthYear, locale)];
  return lenses.filter(
    (lens) =>
      events.filter((event) => lens.includes(event, birthYear)).length >= MIN_LENS_EVENTS &&
      events.some((event) => !lens.includes(event, birthYear)),
  );
}

/**
 * The lenses worth offering for these events, apart from the whole life, which is always available. Names and
 * titles are in the given language, English (DEFAULT_LOCALE) unless one is passed.
 */
export function availableLenses(events: readonly LifeEvent[], birthYear: number | null, locale: Locale = DEFAULT_LOCALE): LensOption[] {
  return allLenses(events, birthYear, locale).map(({ id, name, title }) => ({ id, name, title }));
}

/** The lens that is really in use: the chosen one if it still has a ride, otherwise null for the whole life. */
export function activeLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null, locale: Locale = DEFAULT_LOCALE): LensOption | null {
  return availableLenses(events, birthYear, locale).find((lens) => lens.id === lensId) ?? null;
}

/** The chosen lens id while it still has a ride, otherwise the whole life, so a lens that lapsed never comes back. */
export function keptLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null): string {
  return activeLens(events, lensId, birthYear)?.id ?? WHOLE_LIFE;
}

/** The events a lens shows, in their original order; the whole life when the lens is not available. */
export function applyLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null): readonly LifeEvent[] {
  const lens = allLenses(events, birthYear, DEFAULT_LOCALE).find((option) => option.id === lensId);
  return lens ? events.filter((event) => lens.includes(event, birthYear)) : events;
}

/** Whether a year could be when a living person was born. */
export function isPlausibleBirthYear(year: number, currentYear: number): boolean {
  return Number.isInteger(year) && year >= Math.max(EARLIEST_BIRTH_YEAR, currentYear - OLDEST_AGE) && year <= currentYear;
}

/** A birth year typed by the user, or null when it is blank or not a plausible year. */
export function parseBirthYear(text: string, currentYear: number): number | null {
  const trimmed = text.trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return null;
  }
  const year = Number(trimmed);
  return isPlausibleBirthYear(year, currentYear) ? year : null;
}
