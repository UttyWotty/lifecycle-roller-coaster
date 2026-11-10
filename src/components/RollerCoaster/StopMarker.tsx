/**
 * One stop on a ride, with its marker, its title and its date.
 * It can be selected by mouse, touch or keyboard when a handler is given.
 * Illustrated themes use their own art, and the Simple theme draws a dot or an open station.
 */
import type { CSSProperties, KeyboardEvent, ReactElement } from "react";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { SceneStopArt } from "@/components/Scene/SceneStopArt";
import { EXPORT_HIDDEN_ATTRIBUTE } from "@/lib/export/rideImage";
import type { EventSentiment } from "@/lib/events/schema";
import type { MessageKey } from "@/lib/i18n/messages";
import { markerRadius } from "@/lib/scene/labelLayout";
import { shownDate } from "@/lib/track/labelWidth";
import type { ScenePalette } from "@/lib/scene/themes";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { TrackStop } from "@/lib/track/types";

interface StopMarkerProps {
  stop: TrackStop;
  isStation: boolean;
  isSelected: boolean;
  isTall: boolean;
  /** A stop still to come, drawn a little softer and announced as such. */
  isFuture: boolean;
  palette: ScenePalette | null;
  onSelect?: () => void;
}

const SELECTED_RING_GAP = 6;
const HIT_RADIUS = 26;
const RING_WIDTH = 2;
const STATION_RING_WIDTH = 4;
const TITLE_SIZE = 15;
const DATE_SIZE = 13;
const LABEL_GAP = 26;
const DATE_LINE_GAP = 17;
const LABEL_HALO_WIDTH = 6;
const ACTIVATION_KEYS = ["Enter", " "];
const FUTURE_OPACITY = 0.8;
/** How each feeling is read out in a stop's accessible name. */
const FEELING_NAMES: Readonly<Record<EventSentiment, MessageKey>> = {
  positive: "ride.feelingPositive",
  negative: "ride.feelingNegative",
  neutral: "ride.feelingNeutral",
};
const NO_SUFFIX = "";

/** Paints a background-coloured outline behind text, so nothing runs through a label. */
export const LABEL_HALO = {
  paintOrder: "stroke",
  stroke: "var(--background)",
  strokeWidth: LABEL_HALO_WIDTH,
  strokeLinejoin: "round",
} as const satisfies CSSProperties;

export function StopMarker(props: StopMarkerProps): ReactElement {
  const { stop, isStation, isSelected, isTall, isFuture, palette, onSelect } = props;
  const radius = markerRadius(stop);
  const isAbove = stop.labelSide === "above";
  const titleY = isAbove ? stop.y - radius - LABEL_GAP : stop.y + radius + LABEL_GAP;
  const t = useT();
  const locale = useLocale();
  const date = shownDate(stop.date, locale);
  const color = CATEGORY_COLORS[stop.category];

  function handleKeyDown(event: KeyboardEvent<SVGGElement>): void {
    if (ACTIVATION_KEYS.includes(event.key)) {
      event.preventDefault();
      onSelect?.();
    }
  }

  const interactiveProps = onSelect && {
    role: "button",
    tabIndex: 0,
    "aria-label": t("ride.stopLabel", {
      title: stop.title,
      date,
      future: isFuture ? t("ride.stillToCome") : NO_SUFFIX,
      feeling: t(FEELING_NAMES[stop.sentiment]),
      impact: stop.impact,
    }),
    "aria-pressed": isSelected,
    onClick: onSelect,
    onKeyDown: handleKeyDown,
    className: "cursor-pointer",
  };

  return (
    <g {...interactiveProps} opacity={isFuture ? FUTURE_OPACITY : undefined} data-future={isFuture || undefined}>
      <circle cx={stop.x} cy={stop.y} r={HIT_RADIUS} fill="transparent" />
      {isSelected && (
        <circle
          cx={stop.x}
          cy={stop.y}
          r={radius + SELECTED_RING_GAP}
          {...{ [EXPORT_HIDDEN_ATTRIBUTE]: true }}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_WIDTH}
        />
      )}
      {palette ? (
        <SceneStopArt
          stop={stop}
          date={date}
          isStation={isStation}
          isTall={isTall}
          markerRadius={radius}
          palette={palette}
        />
      ) : (
        <>
          <circle
            cx={stop.x}
            cy={stop.y}
            r={radius}
            fill={isStation ? "var(--background)" : color}
            stroke={isStation ? color : "var(--background)"}
            strokeWidth={isStation ? STATION_RING_WIDTH : RING_WIDTH}
          />
          <text x={stop.x} y={titleY} textAnchor="middle" fontSize={TITLE_SIZE} fontWeight={600} fill="currentColor" {...LABEL_HALO}>
            {stop.title}
          </text>
          <text x={stop.x} y={titleY + DATE_LINE_GAP} textAnchor="middle" fontSize={DATE_SIZE} fill="var(--muted)" {...LABEL_HALO}>
            {date}
          </text>
        </>
      )}
    </g>
  );
}
