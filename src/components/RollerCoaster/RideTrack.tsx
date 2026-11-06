/**
 * SVG drawing of a generated roller-coaster track.
 * Markers can be selected when a handler is given, and major events are drawn larger.
 * The same drawing serves the landing page, the ride stage and image export, so they always match.
 */
import type { KeyboardEvent, ReactElement, Ref } from "react";
import { EXPORT_HIDDEN_ATTRIBUTE } from "@/lib/export/rideImage";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { Track, TrackStop } from "@/lib/track/buildTrack";

interface RideTrackProps {
  track: Track;
  label: string;
  selectedId?: string | null;
  /** Without a handler the track is a plain picture that scales to fit its container. */
  onSelect?: (id: string) => void;
  svgRef?: Ref<SVGSVGElement>;
}

/** Smallest allowed drawing scale. Below this the track scrolls instead, so labels stay readable. */
const MIN_TRACK_SCALE = 0.9;
const MARKER_RADIUS = 9;
const MAJOR_MARKER_RADIUS = 15;
const SELECTED_RING_GAP = 6;
const HIT_RADIUS = 26;
const RAIL_WIDTH = 7;
const TIE_WIDTH = 3;
const TIE_PATTERN = "2 14";
const SUPPORT_WIDTH = 2;
const SUPPORT_OPACITY = 0.3;
const TITLE_SIZE = 15;
const DATE_SIZE = 13;
const LABEL_GAP = 26;
const DATE_LINE_GAP = 17;
const LABEL_HALO_WIDTH = 6;
const ACTIVATION_KEYS = ["Enter", " "];
const UNKNOWN_DATE = "Date unknown";

/** Paints a background-coloured outline behind text, so support posts never run through a label. */
const LABEL_HALO = {
  paintOrder: "stroke",
  stroke: "var(--background)",
  strokeWidth: LABEL_HALO_WIDTH,
  strokeLinejoin: "round",
} as const;

function StopMarker(props: { stop: TrackStop; isSelected: boolean; onSelect?: () => void }): ReactElement {
  const { stop, isSelected, onSelect } = props;
  const radius = stop.isMajor ? MAJOR_MARKER_RADIUS : MARKER_RADIUS;
  const isAbove = stop.labelSide === "above";
  const titleY = isAbove ? stop.y - radius - LABEL_GAP : stop.y + radius + LABEL_GAP;
  const date = stop.date ?? UNKNOWN_DATE;

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
          strokeWidth={SUPPORT_WIDTH}
        />
      )}
      <circle cx={stop.x} cy={stop.y} r={radius} fill={CATEGORY_COLORS[stop.category]} stroke="var(--background)" strokeWidth={SUPPORT_WIDTH} />
      <text x={stop.x} y={titleY} textAnchor="middle" fontSize={TITLE_SIZE} fontWeight={600} fill="currentColor" {...LABEL_HALO}>
        {stop.title}
      </text>
      <text x={stop.x} y={titleY + DATE_LINE_GAP} textAnchor="middle" fontSize={DATE_SIZE} fill="var(--muted)" {...LABEL_HALO}>
        {date}
      </text>
    </g>
  );
}

export function RideTrack(props: RideTrackProps): ReactElement {
  const { track, label, selectedId = null, onSelect, svgRef } = props;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${track.width} ${track.height}`}
      role={onSelect ? "group" : "img"}
      aria-label={label}
      style={onSelect && { minWidth: track.width * MIN_TRACK_SCALE }}
      className="h-auto w-full"
    >
      {track.supports.map(({ x, y }) => (
        <line
          key={`${x}-${y}`}
          x1={x}
          y1={y}
          x2={x}
          y2={track.groundY}
          stroke="currentColor"
          strokeOpacity={SUPPORT_OPACITY}
          strokeWidth={SUPPORT_WIDTH}
        />
      ))}
      <path
        d={track.path}
        pathLength={1}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={RAIL_WIDTH}
        strokeLinecap="round"
        className="ride-track-draw"
        data-testid="ride-path"
      />
      <path
        d={track.path}
        fill="none"
        stroke="var(--background)"
        strokeWidth={TIE_WIDTH}
        strokeDasharray={TIE_PATTERN}
      />
      {track.stops.map((stop) => (
        <StopMarker
          key={stop.id}
          stop={stop}
          isSelected={stop.id === selectedId}
          onSelect={onSelect && (() => onSelect(stop.id))}
        />
      ))}
    </svg>
  );
}
