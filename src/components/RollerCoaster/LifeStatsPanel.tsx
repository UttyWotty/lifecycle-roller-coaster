/**
 * Panel of fun statistics about the story, worked out from the events with no AI.
 * It recalculates from the events, so every edit updates the numbers at once.
 * The numbers are playful observations about a list of events, not a measurement of a life.
 */
import type { ReactElement } from "react";
import { toLabel } from "@/components/EventReview/fieldStyles";
import type { LifeEvent } from "@/lib/events/schema";
import { buildLifeStats, formatYearRange, type EventMove } from "@/lib/stats/lifeStats";

interface LifeStatsPanelProps {
  events: readonly LifeEvent[];
}

const NOT_ENOUGH = "Not enough events yet";

function moveText(move: EventMove | null): string {
  return move ? `${move.from} to ${move.to}` : NOT_ENOUGH;
}

function Stat({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-muted p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="wrap-anywhere font-semibold">{value}</dd>
    </div>
  );
}

export function LifeStatsPanel({ events }: LifeStatsPanelProps): ReactElement {
  const stats = buildLifeStats(events);
  const years = formatYearRange(stats.firstYear, stats.lastYear) ?? NOT_ENOUGH;
  return (
    <section aria-label="Life statistics" className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Life statistics</h2>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Moments" value={String(stats.moments)} />
        <Stat label="Big moments" value={String(stats.bigMoments)} />
        <Stat label="Big changes" value={String(stats.bigChanges)} />
        <Stat label="Years covered" value={years} />
        <Stat label="Biggest comeback" value={moveText(stats.biggestClimb)} />
        <Stat label="Biggest drop" value={moveText(stats.biggestDrop)} />
        <Stat
          label="Longest steady stretch"
          value={stats.calmestStretch ? `${stats.calmestStretch.from} to ${stats.calmestStretch.to}` : NOT_ENOUGH}
        />
        <Stat label="Most common theme" value={stats.topCategory ? toLabel(stats.topCategory) : NOT_ENOUGH} />
      </dl>
    </section>
  );
}
