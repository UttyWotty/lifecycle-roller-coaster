/**
 * Controls for how an event felt and how much it mattered.
 * Sentiment and impact are separate choices, because a neutral event can still be significant.
 * The review stage and the ride stage share these controls.
 */
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import type { EventPatch } from "@/lib/events/editing";
import {
  EVENT_SENTIMENTS,
  IMPACT_MAX,
  IMPACT_MIN,
  type EventSentiment,
  type LifeEvent,
} from "@/lib/events/schema";
import { FIELD_CLASS, LABEL_CLASS } from "./fieldStyles";

interface IntensityFieldsProps {
  event: LifeEvent;
  onChange: (patch: EventPatch) => void;
}

export function IntensityFields({ event, onChange }: IntensityFieldsProps): ReactElement {
  const t = useT();
  return (
    <>
      <label className={LABEL_CLASS}>
        {t("review.feelingLabel")}
        <select
          value={event.sentiment}
          onChange={({ target }) => onChange({ sentiment: target.value as EventSentiment })}
          className={FIELD_CLASS}
        >
          {EVENT_SENTIMENTS.map((sentiment) => (
            <option key={sentiment} value={sentiment}>
              {t(`events.${sentiment}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASS}>
        {t("review.impactLabel", { impact: event.impact, max: IMPACT_MAX })}
        <input
          type="range"
          min={IMPACT_MIN}
          max={IMPACT_MAX}
          value={event.impact}
          onChange={({ target }) => onChange({ impact: Number(target.value) })}
          className="min-h-11 w-full accent-accent"
        />
      </label>
    </>
  );
}
