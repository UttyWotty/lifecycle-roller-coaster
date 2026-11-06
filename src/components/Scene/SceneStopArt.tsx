/**
 * How a stop looks in an illustrated theme: a hub on the rail, a flag on a pole and a label pill.
 * Poles alternate between two heights, so neighbouring labels sit clear of each other.
 * Metro stations and stops labelled below the track skip the pole and keep the pill close.
 */
import type { ReactElement } from "react";
import type { ScenePalette } from "@/lib/scene/themes";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";
import type { TrackStop } from "@/lib/track/types";

interface SceneStopArtProps {
  stop: TrackStop;
  date: string;
  isStation: boolean;
  /** Raises this stop's flag, so it clears the labels on either side. */
  isTall: boolean;
  markerRadius: number;
  palette: ScenePalette;
}

const POLE_HEIGHT = 34;
const TALL_POLE_HEIGHT = 84;
const POLE_WIDTH = 3;
const FLAG_WIDTH = 34;
const FLAG_HEIGHT = 20;
const PILL_HEIGHT = 44;
const PILL_PADDING = 14;
const PILL_RADIUS = 14;
const PILL_GAP = 14;
const PILL_EDGE_WIDTH = 2;
const TITLE_SIZE = 13;
const DATE_SIZE = 11;
const TITLE_BASELINE = 19;
const DATE_BASELINE = 34;
const CHARACTER_WIDTH = 7;
const HUB_RING_WIDTH = 4;
const STATION_RING_WIDTH = 4;

function pillWidth(stop: TrackStop, date: string): number {
  return Math.max(stop.title.length, date.length) * CHARACTER_WIDTH + PILL_PADDING * 2;
}

export function SceneStopArt(props: SceneStopArtProps): ReactElement {
  const { stop, date, isStation, isTall, markerRadius, palette } = props;
  const color = CATEGORY_COLORS[stop.category];
  const isAbove = stop.labelSide === "above";
  const hasFlag = isAbove && !isStation;
  const poleHeight = isTall ? TALL_POLE_HEIGHT : POLE_HEIGHT;
  const poleTop = stop.y - poleHeight;
  const width = pillWidth(stop, date);
  const pillTop = !isAbove
    ? stop.y + markerRadius + PILL_GAP
    : hasFlag
      ? poleTop - PILL_HEIGHT - PILL_GAP / 2
      : stop.y - markerRadius - PILL_GAP - PILL_HEIGHT;
  return (
    <>
      {hasFlag && (
        <>
          <rect x={stop.x - POLE_WIDTH / 2} y={poleTop} width={POLE_WIDTH} height={poleHeight} fill={palette.pill} />
          <path
            d={`M${stop.x} ${poleTop} l-${FLAG_WIDTH} ${FLAG_HEIGHT / 2} l${FLAG_WIDTH} ${FLAG_HEIGHT / 2} Z`}
            fill={color}
          />
        </>
      )}
      <circle
        cx={stop.x}
        cy={stop.y}
        r={markerRadius}
        fill={isStation ? palette.pill : color}
        stroke={isStation ? color : palette.steelDark}
        strokeWidth={isStation ? STATION_RING_WIDTH : HUB_RING_WIDTH}
      />
      <rect
        x={stop.x - width / 2}
        y={pillTop}
        width={width}
        height={PILL_HEIGHT}
        rx={PILL_RADIUS}
        fill={palette.pill}
        stroke={color}
        strokeWidth={PILL_EDGE_WIDTH}
      />
      <text x={stop.x} y={pillTop + TITLE_BASELINE} textAnchor="middle" fontSize={TITLE_SIZE} fontWeight={700} fill={palette.ink}>
        {stop.title}
      </text>
      <text x={stop.x} y={pillTop + DATE_BASELINE} textAnchor="middle" fontSize={DATE_SIZE} fontWeight={600} fill={palette.muted}>
        {date}
      </text>
    </>
  );
}
