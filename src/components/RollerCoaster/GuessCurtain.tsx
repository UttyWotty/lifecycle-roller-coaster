/**
 * The curtain over the part of a ride not yet revealed in Guess my ride, drawn as an overlay above the drawing.
 * It is opaque in the theme's sky colour with a large question mark, so no stop, label or curve still to guess shows.
 * It leaves a window only for the last revealed stop's label pill, which sits clear of the rail.
 */
import type { ReactElement } from "react";
import type { Curtain } from "@/lib/guess/guessGame";
import { isTallStop, PILL_HEIGHT, pillTop, pillWidth, UNKNOWN_DATE } from "@/lib/scene/labelLayout";
import type { ScenePalette } from "@/lib/scene/themes";
import { TITLE_BAND } from "@/lib/track/rideTitle";
import type { Track, TrackStop } from "@/lib/track/types";

interface GuessCurtainProps {
  track: Track;
  curtain: Curtain;
  palette: ScenePalette | null;
}

const MARK = "?";
const MARK_SIZE = 120;
/** The question mark sits this far into the curtain, so it is in view when the curtain edge is. */
const MARK_INSET = 90;
const MARK_OPACITY = 0.35;
const EDGE_WIDTH = 3;
const EDGE_DASHES = "10 8";
const NO_TITLE_BAND = 0;
/** Room around the window, so the pill's outline and halo are not clipped. */
const WINDOW_PADDING = 8;

function rectPath(x: number, y: number, width: number, height: number): string {
  return `M${x} ${y}h${width}v${height}h${-width}Z`;
}

/** The revealed stop's label pill in drawing units, which the curtain leaves open. */
function labelWindow(track: Track, stop: TrackStop, palette: ScenePalette | null, curtainX: number): string {
  const index = track.stops.findIndex(({ id }) => id === stop.id);
  const options = { isStation: track.style === "metro", isBare: palette === null || palette.kind === "line" };
  const width = pillWidth(stop.title, stop.date ?? UNKNOWN_DATE) + WINDOW_PADDING * 2;
  const top = pillTop(stop, isTallStop(index, track.stops.length), options) + track.contentOffset - WINDOW_PADDING;
  /** Only the part inside the curtain is cut out; the rest of the pill is already in the open. */
  const left = Math.max(stop.x - width / 2, curtainX);
  const right = stop.x + width / 2;
  return right > left ? rectPath(left, top, right - left, PILL_HEIGHT + WINDOW_PADDING * 2) : "";
}

export function GuessCurtain({ track, curtain, palette }: GuessCurtainProps): ReactElement {
  const fill = palette?.skyTop ?? "var(--background)";
  const ink = palette?.ink ?? "currentColor";
  /** The title strip stays visible, so the ride's name is never covered. */
  const top = track.title === null ? NO_TITLE_BAND : TITLE_BAND;
  const { x } = curtain;
  const cover = rectPath(x, top, Math.max(track.width - x, 0), track.height - top);
  const window = curtain.after === null ? "" : labelWindow(track, curtain.after, palette, x);
  return (
    <svg
      viewBox={`0 0 ${track.width} ${track.height}`}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      data-testid="guess-curtain"
    >
      <clipPath id="guess-curtain-edge">
        <path d={`${cover}${window}`} clipRule="evenodd" />
      </clipPath>
      <path d={`${cover}${window}`} fill={fill} fillRule="evenodd" />
      <line x1={x} y1={top} x2={x} y2={track.height} stroke={ink} strokeWidth={EDGE_WIDTH} strokeDasharray={EDGE_DASHES} clipPath="url(#guess-curtain-edge)" />
      <text x={x + MARK_INSET} y={track.height / 2} fontSize={MARK_SIZE} fontWeight={700} fill={ink} opacity={MARK_OPACITY} dominantBaseline="middle">
        {MARK}
      </text>
    </svg>
  );
}
