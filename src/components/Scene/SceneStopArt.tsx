/**
 * How a stop looks in an illustrated theme: a hub on the rail, a flag on a pole and a label pill.
 * Poles alternate between two heights, so neighbouring labels sit clear of each other.
 * Metro stations and low stops skip the pole, and Minimal Mode draws an ink-outlined tag with an open circle, so a rail
 * passing behind a label reads as passing behind it rather than broken.
 */
import type { ReactElement } from "react";
import { hasFlag as stopHasFlag, PILL_HEIGHT, pillTop as stopPillTop, pillWidth, POLE_HEIGHT, TALL_POLE_HEIGHT } from "@/lib/scene/labelLayout";
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

const POLE_WIDTH = 3;
const FLAG_WIDTH = 34;
const FLAG_HEIGHT = 20;
const PILL_RADIUS = 14;
const PILL_EDGE_WIDTH = 2;
const TITLE_SIZE = 13;
const DATE_SIZE = 11;
const TITLE_BASELINE = 19;
const DATE_BASELINE = 34;
const HUB_RING_WIDTH = 4;
const STATION_RING_WIDTH = 4;

export function SceneStopArt(props: SceneStopArtProps): ReactElement {
  const { stop, date, isStation, isTall, markerRadius, palette } = props;
  const isBare = palette.kind === "line";
  const color = isBare ? palette.ink : CATEGORY_COLORS[stop.category];
  const options = { isStation, isBare };
  const hasFlag = stopHasFlag(stop, options);
  const poleHeight = isTall ? TALL_POLE_HEIGHT : POLE_HEIGHT;
  const poleTop = stop.y - poleHeight;
  const width = pillWidth(stop.title, date);
  const pillTop = stopPillTop(stop, isTall, options);
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
        fill={isStation || isBare ? palette.pill : color}
        stroke={isStation || isBare ? color : palette.steelDark}
        strokeWidth={isStation || isBare ? STATION_RING_WIDTH : HUB_RING_WIDTH}
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
