/**
 * The look of a ride's future: a soft veil over the stretch still to come and a dashed "Today" line with its sign.
 * The veil uses the theme's own sky colour, so what is ahead looks hazy rather than greyed out, in every theme.
 * It sits behind the stops, so the stops to come and their labels stay readable, and it exports with the picture.
 */
import type { ReactElement } from "react";
import { LABEL_HALO } from "@/components/RollerCoaster/StopMarker";
import type { ScenePalette } from "@/lib/scene/themes";
import { TITLE_BAND } from "@/lib/track/rideTitle";
import type { Track } from "@/lib/track/types";

interface FutureVeilProps {
  track: Track;
  palette: ScenePalette | null;
}

const VEIL_OPACITY = 0.55;
const LINE_WIDTH = 2;
const LINE_DASHES = "6 6";
const SIGN_SIZE = 14;
const SIGN_TEXT = "TODAY";
/** The sign sits this far above the highest stop, below any title. */
const SIGN_RISE = 96;
const SIGN_INSET = 18;
const NO_TITLE_BAND = 0;

export function FutureVeil({ track, palette }: FutureVeilProps): ReactElement | null {
  const { future } = track;
  if (future === null) {
    return null;
  }
  const top = -track.contentOffset + (track.title === null ? NO_TITLE_BAND : TITLE_BAND) + SIGN_INSET;
  const highest = Math.min(...track.stops.map(({ y }) => y));
  const signY = Math.max(top, highest - SIGN_RISE);
  const ink = palette?.ink ?? "currentColor";
  const halo = palette ? { ...LABEL_HALO, stroke: palette.pill } : LABEL_HALO;
  return (
    <g data-testid="future-veil" pointerEvents="none">
      <rect
        x={future.x}
        y={-track.contentOffset}
        width={Math.max(track.width - future.x, 0)}
        height={track.height}
        fill={palette?.skyBottom ?? "var(--background)"}
        opacity={VEIL_OPACITY}
      />
      <line
        x1={future.x}
        y1={signY + SIGN_INSET / 2}
        x2={future.x}
        y2={track.groundY}
        stroke={ink}
        strokeWidth={LINE_WIDTH}
        strokeDasharray={LINE_DASHES}
      />
      <text x={future.x} y={signY} textAnchor="middle" fontSize={SIGN_SIZE} fontWeight={700} fill={ink} {...halo}>
        {SIGN_TEXT}
      </text>
    </g>
  );
}
