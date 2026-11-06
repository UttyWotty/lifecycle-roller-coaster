/**
 * SVG drawing of a generated ride, in any style and theme.
 * It draws whatever the generators returned, with a full scene when the theme has one.
 * The same drawing serves the landing page, the ride stage and image export, so they always match.
 */
import type { ReactElement, Ref } from "react";
import { toLabel } from "@/components/EventReview/fieldStyles";
import { RideCart } from "@/components/Scene/RideCart";
import { SkyMarkers } from "@/components/Scene/SkyMarkers";
import { DRAW_TEST_ID, Rail } from "@/components/Scene/Rail";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { Track, TrackLine } from "@/lib/track/types";
import { LABEL_HALO, StopMarker } from "./StopMarker";

interface RideTrackProps {
  track: Track;
  label: string;
  /** Null draws the simple page-coloured ride. */
  scene: Scene | null;
  selectedId?: string | null;
  /** Without a handler the track is a plain picture that scales to fit its container. */
  onSelect?: (id: string) => void;
  /** Shrinks an interactive ride to fit its container, instead of scrolling sideways. */
  fitToScreen?: boolean;
  svgRef?: Ref<SVGSVGElement>;
}

/** Smallest allowed drawing scale. Below this the track scrolls instead, so labels stay readable. */
const MIN_TRACK_SCALE = 0.9;
const METRO_LINE_WIDTH = 6;
const METRO_CASING_WIDTH = 4;
const SUPPORT_WIDTH = 2;
const SUPPORT_OPACITY = 0.3;
const LINE_NAME_SIZE = 13;
const LINE_NAME_GAP = 10;
const LINE_NAME_DROP = 4;
const SERIF_FONT = "Georgia, 'Times New Roman', serif";

function MetroLine(props: {
  line: TrackLine;
  category: NonNullable<TrackLine["category"]>;
  palette: ScenePalette | null;
}): ReactElement {
  const { line, category, palette } = props;
  const nameHalo = palette ? { ...LABEL_HALO, stroke: palette.pill } : LABEL_HALO;
  return (
    <>
      {palette && (
        <path
          d={line.path}
          fill="none"
          stroke={palette.pill}
          strokeWidth={METRO_LINE_WIDTH + METRO_CASING_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
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
        fill={palette?.ink ?? "var(--muted)"}
        {...nameHalo}
      >
        {toLabel(category)}
      </text>
    </>
  );
}

export function RideTrack(props: RideTrackProps): ReactElement {
  const { track, label, scene, selectedId = null, onSelect, fitToScreen = false, svgRef } = props;
  const palette = scene?.palette ?? null;
  const rail = track.lines.find(({ category }) => category === null);
  const railEnd = track.profile.at(-1);
  const mode = palette ? sceneModeFor(palette.kind) : null;
  const RailArt = mode?.Rail ?? Rail;
  const isStation = track.style === "metro";
  const titleFont = palette?.kind === "poster" ? { fontFamily: SERIF_FONT, fontStyle: "italic" } : undefined;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${track.width} ${track.height}`}
      role={onSelect ? "group" : "img"}
      aria-label={label}
      style={onSelect && !fitToScreen ? { minWidth: track.width * MIN_TRACK_SCALE } : undefined}
      className={palette ? "h-auto w-full rounded-2xl" : "h-auto w-full"}
    >
      {scene && mode && <mode.Backdrop scene={scene} track={track} />}
      {track.title && (
        <text x={track.title.x} y={track.title.y} fontSize={track.title.fontSize} fontWeight={700} fill={palette ? palette.title : "currentColor"} {...titleFont}>
          {track.title.text}
        </text>
      )}
      <g transform={`translate(0 ${track.contentOffset})`}>
        {palette && mode && <mode.Structure track={track} palette={palette} />}
        {!palette && track.supports.map(({ x, y }) => (
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
            <RailArt key="rail" path={line.path} palette={palette} />
          ) : (
            <MetroLine key={line.category} line={line} category={line.category} palette={palette} />
          ),
        )}
        {scene && <SkyMarkers scenery={scene.scenery} palette={scene.palette} />}
        {track.stops.map((stop, index) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            isStation={isStation}
            isTall={index % 2 === 0 || index === track.stops.length - 1}
            palette={palette}
            isSelected={stop.id === selectedId}
            onSelect={onSelect && (() => onSelect(stop.id))}
          />
        ))}
        {scene && rail && railEnd && (
          <RideCart
            path={rail.path}
            parkedAt={railEnd}
            stopCount={track.stops.length}
            color={scene.palette.cart}
            rider={scene.rider}
            isMonochrome={scene.palette.kind === "line"}
          />
        )}
      </g>
    </svg>
  );
}
