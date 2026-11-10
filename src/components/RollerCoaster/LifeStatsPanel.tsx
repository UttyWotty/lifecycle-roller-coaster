/**
 * Panel of fun statistics about the story, worked out from the events with no AI.
 * It recalculates from the events, so every edit updates the numbers at once.
 * The numbers are playful observations about a list of events, not a measurement of a life.
 */
import type { ReactElement } from "react";
import { useLocale, useT, type Translate } from "@/components/I18n/useLocale";
import type { LifeEvent } from "@/lib/events/schema";
import { buildLifeStats, formatYearRange, type CalmStretch, type EventMove } from "@/lib/stats/lifeStats";

interface LifeStatsPanelProps {
  events: readonly LifeEvent[];
}

function moveText(t: Translate, move: EventMove | CalmStretch | null): string {
  return move ? t("stats.move", { from: move.from, to: move.to }) : t("stats.notEnough");
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
  const t = useT();
  const locale = useLocale();
  const stats = buildLifeStats(events);
  const years = formatYearRange(stats.firstYear, stats.lastYear, locale) ?? t("stats.notEnough");
  const heading = t("stats.heading");
  return (
    <section aria-label={heading} className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("stats.moments")} value={String(stats.moments)} />
        <Stat label={t("stats.bigMoments")} value={String(stats.bigMoments)} />
        <Stat label={t("stats.bigChanges")} value={String(stats.bigChanges)} />
        <Stat label={t("stats.yearsCovered")} value={years} />
        <Stat label={t("stats.biggestComeback")} value={moveText(t, stats.biggestClimb)} />
        <Stat label={t("stats.biggestDrop")} value={moveText(t, stats.biggestDrop)} />
        <Stat label={t("stats.longestSteady")} value={moveText(t, stats.calmestStretch)} />
        <Stat label={t("stats.topTheme")} value={stats.topCategory ? t(`events.${stats.topCategory}`) : t("stats.notEnough")} />
      </dl>
    </section>
  );
}
