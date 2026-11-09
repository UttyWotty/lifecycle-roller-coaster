/**
 * Pure ride lenses: ways to turn one story into several rides by part of life, by decade or by age.
 * Each lens picks a subset of the events in their original order and carries a title ready for sharing.
 * A lens appears only when it has enough events to make a ride, and age lenses need the year the person was born.
 */
import type { EventCategory, LifeEvent } from "@/lib/events/schema";

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

/** Parts of life worth a ride of their own. "Other" is a catch-all, so it gets no lens. */
const PART_TITLES: Readonly<Partial<Record<EventCategory, { name: string; title: string }>>> = {
  career: { name: "Career", title: "My Career Coaster" },
  business: { name: "Business", title: "My Entrepreneur Journey" },
  relationships: { name: "Relationships", title: "My Relationship Coaster" },
  education: { name: "School", title: "My School Years" },
  finance: { name: "Money", title: "My Money Coaster" },
  health: { name: "Health", title: "My Health Journey" },
  personal: { name: "Personal", title: "My Personal Journey" },
};

function eventYear(event: LifeEvent): number | null {
  return event.date === null ? null : Number(event.date.slice(0, YEAR_DIGITS));
}

function ageAt(event: LifeEvent, birthYear: number | null): number | null {
  const year = eventYear(event);
  return year === null || birthYear === null ? null : year - birthYear;
}

function partLenses(events: readonly LifeEvent[]): Lens[] {
  const categories = [...new Set(events.map((event) => event.category))];
  return categories.flatMap((category) => {
    const part = PART_TITLES[category];
    return part ? [{ id: `part:${category}`, ...part, includes: (event: LifeEvent) => event.category === category }] : [];
  });
}

function decadeLenses(events: readonly LifeEvent[]): Lens[] {
  const decades = [...new Set(events.flatMap((event) => {
    const year = eventYear(event);
    return year === null ? [] : [Math.floor(year / DECADE) * DECADE];
  }))].sort((a, b) => a - b);
  return decades.map((decade) => ({
    id: `decade:${decade}`,
    name: `${decade}s`,
    title: `My ${decade}s`,
    includes: (event: LifeEvent) => {
      const year = eventYear(event);
      return year !== null && year >= decade && year < decade + DECADE;
    },
  }));
}

function ageLenses(events: readonly LifeEvent[], birthYear: number | null): Lens[] {
  if (birthYear === null) {
    return [];
  }
  const ages = [...new Set(events.flatMap((event) => {
    const age = ageAt(event, birthYear);
    return age === null || age < TEENS ? [] : [Math.floor(age / DECADE) * DECADE];
  }))].sort((a, b) => a - b);
  const byDecade = ages.map((from): Lens => ({
    id: `age:${from}`,
    name: from === TEENS ? "My teens" : `My ${from}s`,
    title: from === TEENS ? "My Teenage Roller Coaster" : `My ${from}s Roller Coaster`,
    includes: (event, born) => {
      const age = ageAt(event, born);
      return age !== null && age >= from && age < from + DECADE;
    },
  }));
  const split: Lens[] = [
    {
      id: `before:${TURNING_AGE}`,
      name: `Before ${TURNING_AGE}`,
      title: `My Life Before ${TURNING_AGE}`,
      includes: (event, born) => {
        const age = ageAt(event, born);
        return age !== null && age < TURNING_AGE;
      },
    },
    {
      id: `after:${TURNING_AGE}`,
      name: `After ${TURNING_AGE}`,
      title: `My Life After ${TURNING_AGE}`,
      includes: (event, born) => {
        const age = ageAt(event, born);
        return age !== null && age >= TURNING_AGE;
      },
    },
  ];
  return [...byDecade, ...split];
}

function allLenses(events: readonly LifeEvent[], birthYear: number | null): Lens[] {
  const lenses = [...partLenses(events), ...decadeLenses(events), ...ageLenses(events, birthYear)];
  return lenses.filter(
    (lens) =>
      events.filter((event) => lens.includes(event, birthYear)).length >= MIN_LENS_EVENTS &&
      events.some((event) => !lens.includes(event, birthYear)),
  );
}

/** The lenses worth offering for these events, apart from the whole life, which is always available. */
export function availableLenses(events: readonly LifeEvent[], birthYear: number | null): LensOption[] {
  return allLenses(events, birthYear).map(({ id, name, title }) => ({ id, name, title }));
}

/** The lens that is really in use: the chosen one if it still has a ride, otherwise the whole life. */
export function activeLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null): LensOption | null {
  return availableLenses(events, birthYear).find((lens) => lens.id === lensId) ?? null;
}

/** The chosen lens id while it still has a ride, otherwise the whole life, so a lens that lapsed never comes back. */
export function keptLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null): string {
  return activeLens(events, lensId, birthYear)?.id ?? WHOLE_LIFE;
}

/** The events a lens shows, in their original order; the whole life when the lens is not available. */
export function applyLens(events: readonly LifeEvent[], lensId: string, birthYear: number | null): readonly LifeEvent[] {
  const lens = allLenses(events, birthYear).find((option) => option.id === lensId);
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
