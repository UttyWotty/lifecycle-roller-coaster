/**
 * Pure operations for reviewing and correcting a list of life events.
 * Every function returns new data, so React state can use them directly.
 * This module works the same for AI and manual events, and imports no AI or UI code.
 */
import {
  CONFIDENCE_MAX,
  lifeEventSchema,
  type LifeEvent,
} from "./schema";

export type EventPatch = Partial<Omit<LifeEvent, "id" | "confidence">>;
export type EventField = keyof LifeEvent;
export type MoveDirection = -1 | 1;

export const DEFAULT_IMPACT = 5;

const EVENT_ID_PREFIX = "event_";
const EVENT_ID_DIGITS = 3;
const FIRST_EVENT_NUMBER = 1;
/** Changing one of these means the user has settled the interpretation themselves. */
const INTERPRETATION_FIELDS: readonly EventField[] = ["date", "sentiment", "impact"];

export function formatEventId(eventNumber: number): string {
  return `${EVENT_ID_PREFIX}${String(eventNumber).padStart(EVENT_ID_DIGITS, "0")}`;
}

function eventNumber(id: string): number {
  const parsed = Number(id.slice(EVENT_ID_PREFIX.length));
  return Number.isInteger(parsed) ? parsed : 0;
}

/** Numbers past the highest id in use, so a new id can never match an event in the list. */
function nextEventId(events: readonly LifeEvent[]): string {
  const highest = Math.max(0, ...events.map(({ id }) => eventNumber(id)));
  return formatEventId(highest + FIRST_EVENT_NUMBER);
}

export function addBlankEvent(events: readonly LifeEvent[]): LifeEvent[] {
  const blank: LifeEvent = {
    id: nextEventId(events),
    date: null,
    title: "",
    description: "",
    category: "other",
    sentiment: "neutral",
    impact: DEFAULT_IMPACT,
    confidence: CONFIDENCE_MAX,
  };
  return [...events, blank];
}

export function updateEvent(
  events: readonly LifeEvent[],
  id: string,
  patch: EventPatch,
): LifeEvent[] {
  const settlesInterpretation = INTERPRETATION_FIELDS.some((field) => field in patch);
  return events.map((event) => {
    if (event.id !== id) {
      return event;
    }
    const confidence = settlesInterpretation ? CONFIDENCE_MAX : event.confidence;
    return { ...event, ...patch, confidence };
  });
}

export function confirmEvent(events: readonly LifeEvent[], id: string): LifeEvent[] {
  return events.map((event) =>
    event.id === id ? { ...event, confidence: CONFIDENCE_MAX } : event,
  );
}

export function deleteEvent(events: readonly LifeEvent[], id: string): LifeEvent[] {
  return events.filter((event) => event.id !== id);
}

/** Puts a deleted event back near its old position, giving it a new id if that one was reused. */
export function restoreEvent(
  events: readonly LifeEvent[],
  event: LifeEvent,
  index: number,
): LifeEvent[] {
  const isIdTaken = events.some(({ id }) => id === event.id);
  const restored = isIdTaken ? { ...event, id: nextEventId(events) } : event;
  return [...events.slice(0, index), restored, ...events.slice(index)];
}

export function moveEvent(
  events: readonly LifeEvent[],
  id: string,
  direction: MoveDirection,
): LifeEvent[] {
  const from = events.findIndex((event) => event.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= events.length) {
    return [...events];
  }
  const reordered = [...events];
  [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
  return reordered;
}

/** Sorts oldest first. Partial dates sort before fuller ones, and undated events go last. */
export function sortEventsByDate(events: readonly LifeEvent[]): LifeEvent[] {
  return [...events].sort((first, second) => {
    if (first.date === null || second.date === null) {
      return Number(first.date === null) - Number(second.date === null);
    }
    return first.date.localeCompare(second.date);
  });
}

/** Lists the fields that fail the shared contract for each event that has a problem. */
export function findInvalidFields(events: readonly LifeEvent[]): Record<string, EventField[]> {
  const invalid: Record<string, EventField[]> = {};
  for (const event of events) {
    const result = lifeEventSchema.safeParse(event);
    if (!result.success) {
      invalid[event.id] = result.error.issues.map(({ path }) => path[0] as EventField);
    }
  }
  return invalid;
}
