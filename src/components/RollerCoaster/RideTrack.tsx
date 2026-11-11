/**
 * SVG drawing of a generated ride, in any style and theme.
 * It draws whatever the generators returned, with a full scene when the theme has one.
 * The same drawing serves the landing page, the ride stage and image export, so they always match.
 */
import type { ReactElement, Ref } from "react";
import { useT } from "@/components/I18n/useLocale";
import { ChapterBands } from "@/components/Scene/ChapterBands";
import { FutureVeil } from "@/components/Scene/FutureVeil";
import { RideCart } from "@/components/Scene/RideCart";
import { SkyMarkers } from "@/components/Scene/SkyMarkers";
import { DRAW_TEST_ID, Rail } from "@/components/Scene/Rail";
import { sceneModeFor } from "@/components/Scene/sceneModes";
import type { Scene } from "@/lib/scene/composeRide";
import { isTallStop, LINE_NAME_DROP, LINE_NAME_GAP, LINE_NAME_SIZE } from "@/lib/scene/labelLayout";
import type { ScenePalette, SceneryKind } from "@/lib/scene/themes";
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
export const MIN_TRACK_SCALE = 0.9;
const METRO_LINE_WIDTH = 6;
const METRO_CASING_WIDTH = 4;
const MONOCHROME_LINE_WIDTH = 3;
/** Without colour, each line is told apart by its dashes, like a printed map. */
const MONOCHROME_DASHES = ["none", "12 7", "3 6", "18 6 3 6", "2 12", "24 8", "8 4 2 4 2 4", "5 5"];
const SUPPORT_WIDTH = 2;
const SUPPORT_OPACITY = 0.3;
const TITLE_FONTS: Readonly<Partial<Record<SceneryKind, { fontFamily: string; fontStyle?: string }>>> = {
  poster: { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" },
  arcade: { fontFamily: "'Courier New', Courier, monospace" },
  comic: { fontFamily: "Impact, 'Arial Black', sans-serif", fontStyle: "italic" },
};

function MetroLine(props: {
  line: TrackLine;
  category: NonNullable<TrackLine["category"]>;
  palette: ScenePalette | null;
  index: number;
}): ReactElement {
  const { line, category, palette, index } = props;
  const t = useT();
  const isMonochrome = palette?.kind === "line";
  const nameHalo = palette ? { ...LABEL_HALO, stroke: palette.pill } : LABEL_HALO;
  return (
    <>
      {palette && !isMonochrome && (
        <path
          d={line.path}
          fill="none"
          stroke={palette.pill}
          strokeWidth={METRO_LINE_WIDTH + METRO_CASING_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {isMonochrome ? (
        <path
          d={line.path}
          fill="none"
          stroke={palette.ink}
          strokeWidth={MONOCHROME_LINE_WIDTH}
          strokeDasharray={MONOCHROME_DASHES[index % MONOCHROME_DASHES.length]}
          strokeLinejoin="round"
          data-testid={DRAW_TEST_ID}
        />
      ) : (
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
      )}
      <text
        x={line.start.x - LINE_NAME_GAP}
        y={line.start.y + LINE_NAME_DROP}
        textAnchor="end"
        fontSize={LINE_NAME_SIZE}
        fontWeight={600}
        fill={palette?.ink ?? "var(--muted)"}
        {...nameHalo}
      >
        {t(`events.${category}`)}
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
  const titleFont = palette ? TITLE_FONTS[palette.kind] : undefined;
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
        {track.lines.map((line, index) =>
          line.category === null ? (
            <RailArt key="rail" path={line.path} palette={palette} />
          ) : (
            <MetroLine key={line.category} line={line} category={line.category} palette={palette} index={index} />
          ),
        )}
        {scene && <SkyMarkers scenery={scene.scenery} palette={scene.palette} />}
        <FutureVeil track={track} palette={palette} />
        {track.stops.map((stop, index) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            isStation={isStation}
            isTall={isTallStop(index, track.stops.length)}
            palette={palette}
            isSelected={stop.id === selectedId}
            isFuture={track.future !== null && index >= track.future.fromIndex}
            onSelect={onSelect && (() => onSelect(stop.id))}
          />
        ))}
        {scene && rail && railEnd && (
          <RideCart
            path={track.future?.pastRail ?? rail.path}
            parkedAt={track.future?.parkAt ?? railEnd}
            stopCount={track.stops.length}
            color={scene.palette.cart}
            rider={scene.rider}
            isMonochrome={scene.palette.kind === "line"}
            Vehicle={sceneModeFor(scene.palette.kind).Vehicle}
          />
        )}
        {track.chapterBands.length > 0 && <ChapterBands track={track} palette={palette} />}
      </g>
    </svg>
  );
}
