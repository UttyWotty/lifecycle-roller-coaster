/**
 * The look of a ride's future: a soft veil over the stretch still to come and a dashed "Today" line with its sign.
 * The veil uses the theme's own sky colour, so what is ahead looks hazy rather than greyed out, in every theme.
 * The sign is a solid pill like a stop's label, so it reads over any scenery, and the line takes the theme's title
 * colour, which every sky is made to show. It sits behind the stops, and it exports with the picture.
 */
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
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
/** The sign sits this far above the highest stop, below any title. */
const SIGN_RISE = 96;
const SIGN_INSET = 18;
const PILL_WIDTH = 64;
const PILL_HEIGHT = 24;
const PILL_RADIUS = 12;
const PILL_EDGE_WIDTH = 1.5;
/** Moves the text's baseline down from the pill's middle, so the capitals sit centred in it. */
const TEXT_DROP = 5;
const HALF = 2;
const NO_TITLE_BAND = 0;

export function FutureVeil({ track, palette }: FutureVeilProps): ReactElement | null {
  const t = useT();
  const { future } = track;
  if (future === null) {
    return null;
  }
  const top = -track.contentOffset + (track.title === null ? NO_TITLE_BAND : TITLE_BAND) + SIGN_INSET;
  const highest = Math.min(...track.stops.map(({ y }) => y));
  const signY = Math.max(top, highest - SIGN_RISE);
  const ink = palette?.ink ?? "currentColor";
  const line = palette?.title ?? "currentColor";
  const pill = palette?.pill ?? "var(--background)";
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
        y1={signY + PILL_HEIGHT / HALF}
        x2={future.x}
        y2={track.groundY}
        stroke={line}
        strokeWidth={LINE_WIDTH}
        strokeDasharray={LINE_DASHES}
      />
      <rect
        x={future.x - PILL_WIDTH / HALF}
        y={signY - PILL_HEIGHT / HALF}
        width={PILL_WIDTH}
        height={PILL_HEIGHT}
        rx={PILL_RADIUS}
        fill={pill}
        stroke={line}
        strokeWidth={PILL_EDGE_WIDTH}
      />
      <text x={future.x} y={signY + TEXT_DROP} textAnchor="middle" fontSize={SIGN_SIZE} fontWeight={700} fill={ink}>
        {t("ride.today")}
      </text>
    </g>
  );
}
