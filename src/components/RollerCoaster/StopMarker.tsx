/**
 * One stop on a ride, with its marker, its title and its date.
 * It can be selected by mouse, touch or keyboard when a handler is given.
 * Illustrated themes use their own art, and the Simple theme draws a dot or an open station.
 */
import type { CSSProperties, KeyboardEvent, ReactElement } from "react";
import { SceneStopArt } from "@/components/Scene/SceneStopArt";
import { EXPORT_HIDDEN_ATTRIBUTE } from "@/lib/export/rideImage";
import type { ScenePalette } from "@/lib/scene/themes";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { TrackStop } from "@/lib/track/types";

interface StopMarkerProps {
  stop: TrackStop;
  isStation: boolean;
  isSelected: boolean;
  isTall: boolean;
  palette: ScenePalette | null;
  onSelect?: () => void;
}

const MARKER_RADIUS = 9;
const MAJOR_MARKER_RADIUS = 15;
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
const UNKNOWN_DATE = "Date unknown";

/** Paints a background-coloured outline behind text, so nothing runs through a label. */
export const LABEL_HALO = {
  paintOrder: "stroke",
  stroke: "var(--background)",
  strokeWidth: LABEL_HALO_WIDTH,
  strokeLinejoin: "round",
} as const satisfies CSSProperties;

export function StopMarker(props: StopMarkerProps): ReactElement {
  const { stop, isStation, isSelected, isTall, palette, onSelect } = props;
  const radius = stop.isMajor ? MAJOR_MARKER_RADIUS : MARKER_RADIUS;
  const isAbove = stop.labelSide === "above";
  const titleY = isAbove ? stop.y - radius - LABEL_GAP : stop.y + radius + LABEL_GAP;
  const date = stop.date ?? UNKNOWN_DATE;
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
    "aria-label": `${stop.title}, ${date}, ${stop.sentiment}, impact ${stop.impact}`,
    "aria-pressed": isSelected,
    onClick: onSelect,
    onKeyDown: handleKeyDown,
    className: "cursor-pointer",
  };

  return (
    <g {...interactiveProps}>
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
