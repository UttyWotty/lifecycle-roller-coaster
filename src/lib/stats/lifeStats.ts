/**
 * Pure statistics about a life story, worked out from its events with no AI.
 * They use the same levels as the ride, so the numbers always match what is drawn.
 * Everything here recalculates from the events, so edits update it at once.
 */
import type { EventCategory, LifeEvent } from "@/lib/events/schema";
import { eventLevels } from "@/lib/track/buildTrack";

export interface EventMove {
  from: string;
  to: string;
  size: number;
}

export interface CalmStretch {
  from: string;
  to: string;
  length: number;
}

export interface LifeStats {
  moments: number;
  bigMoments: number;
  bigChanges: number;
  biggestClimb: EventMove | null;
  biggestDrop: EventMove | null;
  calmestStretch: CalmStretch | null;
  topCategory: EventCategory | null;
  firstYear: number | null;
  lastYear: number | null;
}

/** A jump of this many levels between neighbouring events counts as a big change. */
const BIG_CHANGE = 8;
const BIG_MOMENT_IMPACT = 8;
/** Neighbouring events this close in level count as a calm stretch. */
const CALM_CHANGE = 3;
const SHORTEST_CALM_STRETCH = 2;
const YEAR_LENGTH = 4;

function strongestMove(events: readonly LifeEvent[], levels: readonly number[], direction: 1 | -1): EventMove | null {
  let best: EventMove | null = null;
  for (let index = 1; index < events.length; index += 1) {
    const size = (levels[index] - levels[index - 1]) * direction;
    if (size > 0 && size > (best?.size ?? 0)) {
      best = { from: events[index - 1].title, to: events[index].title, size };
    }
  }
  return best;
}

function longestCalmStretch(events: readonly LifeEvent[], levels: readonly number[]): CalmStretch | null {
  let best: CalmStretch | null = null;
  let start = 0;
  for (let index = 1; index <= events.length; index += 1) {
    const isCalm = index < events.length && Math.abs(levels[index] - levels[index - 1]) <= CALM_CHANGE;
    if (!isCalm) {
      const length = index - start;
      if (length >= SHORTEST_CALM_STRETCH && length > (best?.length ?? 0)) {
        best = { from: events[start].title, to: events[index - 1].title, length };
      }
      start = index;
    }
  }
  return best;
}

function mostCommonCategory(events: readonly LifeEvent[]): EventCategory | null {
  const counts = new Map<EventCategory, number>();
  for (const { category } of events) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts].reduce<[EventCategory, number] | null>(
    (best, entry) => (best && best[1] >= entry[1] ? best : entry),
    null,
  )?.[0] ?? null;
}

export function buildLifeStats(events: readonly LifeEvent[]): LifeStats {
  const levels = eventLevels(events);
  const years = events.flatMap(({ date }) => (date ? [Number(date.slice(0, YEAR_LENGTH))] : []));
  const changes = levels.slice(1).map((level, index) => Math.abs(level - levels[index]));
  return {
    moments: events.length,
    bigMoments: events.filter(({ impact }) => impact >= BIG_MOMENT_IMPACT).length,
    bigChanges: changes.filter((change) => change >= BIG_CHANGE).length,
    biggestClimb: strongestMove(events, levels, 1),
    biggestDrop: strongestMove(events, levels, -1),
    calmestStretch: longestCalmStretch(events, levels),
    topCategory: mostCommonCategory(events),
    firstYear: years.length > 0 ? Math.min(...years) : null,
    lastYear: years.length > 0 ? Math.max(...years) : null,
  };
}
