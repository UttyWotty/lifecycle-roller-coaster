/**
 * SVG drawing of a generated ride, in any style.
 * It draws whatever lines, supports and stops the generator returned, plus the title when there is one.
 * The same drawing serves the landing page, the ride stage and image export, so they always match.
 */
import type { ReactElement, Ref } from "react";
import { toLabel } from "@/components/EventReview/fieldStyles";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { Track, TrackLine } from "@/lib/track/types";
import { LABEL_HALO, StopMarker } from "./StopMarker";

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
const RAIL_WIDTH = 7;
const TIE_WIDTH = 3;
const TIE_PATTERN = "2 14";
const METRO_LINE_WIDTH = 6;
const SUPPORT_WIDTH = 2;
const SUPPORT_OPACITY = 0.3;
const LINE_NAME_SIZE = 13;
const LINE_NAME_GAP = 10;
const LINE_NAME_DROP = 4;
const DRAW_TEST_ID = "ride-path";

function Rail({ path }: { path: string }): ReactElement {
  return (
    <>
      <path
        d={path}
        pathLength={1}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={RAIL_WIDTH}
        strokeLinecap="round"
        className="ride-track-draw"
        data-testid={DRAW_TEST_ID}
      />
      <path d={path} fill="none" stroke="var(--background)" strokeWidth={TIE_WIDTH} strokeDasharray={TIE_PATTERN} />
    </>
  );
}

function MetroLine({ line, category }: { line: TrackLine; category: NonNullable<TrackLine["category"]> }): ReactElement {
  return (
    <>
      <path
        d={line.path}
        pathLength={1}
        fill="none"
        stroke={CATEGORY_COLORS[category]}
        strokeWidth={METRO_LINE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ride-track-draw"
        data-testid={DRAW_TEST_ID}
      />
      <text
        x={line.start.x - LINE_NAME_GAP}
        y={line.start.y + LINE_NAME_DROP}
        textAnchor="end"
        fontSize={LINE_NAME_SIZE}
        fontWeight={600}
        fill="var(--muted)"
        {...LABEL_HALO}
      >
        {toLabel(category)}
      </text>
    </>
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
      {track.title && (
        <text x={track.title.x} y={track.title.y} fontSize={track.title.fontSize} fontWeight={700} fill="currentColor">
          {track.title.text}
        </text>
      )}
      <g transform={`translate(0 ${track.contentOffset})`}>
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
        {track.lines.map((line) =>
          line.category === null ? (
            <Rail key="rail" path={line.path} />
          ) : (
            <MetroLine key={line.category} line={line} category={line.category} />
          ),
        )}
        {track.stops.map((stop) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            isStation={track.style === "metro"}
            isSelected={stop.id === selectedId}
            onSelect={onSelect && (() => onSelect(stop.id))}
          />
        ))}
      </g>
    </svg>
  );
}
