/**
 * Retro Mode: a flat vintage travel poster, with sweeping colour bands, stars and a slatted structure.
 * Every shape is a solid colour with no gradients, like an old screen print.
 * The art is original, and the title uses a serif italic to suit the period.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track, TrackPoint } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SLAT_SPACING = 18;
const SLAT_WIDTH = 3;
const STRIPE_WIDTH = 7;
const STRIPE_GAP = 8;
const STAR_POINTS = "0,-13 2.5,-2.5 13,0 2.5,2.5 0,13 -2.5,2.5 -13,0 -2.5,-2.5";
const BAND_WIDTHS = [0.62, 0.5, 0.38, 0.26];
const STAR_SHARE_OF_SKY = 0.42;
const STAR_LIMIT_SPACING = 3;

function pointList(points: readonly TrackPoint[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

export function PosterBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
  const bands = [palette.skyBottom, palette.steel, palette.cloud, palette.skylineFar];
  const stars = scenery.clouds.filter((_, index) => index % STAR_LIMIT_SPACING !== 2);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <rect width={width} height={height} fill={palette.skyTop} data-testid="scene-sky" />
      {BAND_WIDTHS.map((share, index) => (
        <ellipse key={share} cx={width * 0.45} cy={height * 1.08} rx={width * 0.72} ry={height * share} fill={bands[index]} />
      ))}
      {stars.map(({ x, y, scale }) => (
        <polygon
          key={x}
          points={STAR_POINTS}
          transform={`translate(${x} ${y * STAR_SHARE_OF_SKY + 30}) scale(${scale})`}
          fill={palette.pill}
          data-testid="poster-star"
        />
      ))}
    </g>
  );
}

export function PosterStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, groundY } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const count = Math.floor((last.x - first.x) / SLAT_SPACING);
  const slats = Array.from({ length: count }, (_, index) => first.x + index * SLAT_SPACING);
  const outline = pointList([{ x: first.x, y: groundY }, ...profile, { x: last.x, y: groundY }]);
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <polygon points={outline} fill={palette.pill} />
      <g stroke={palette.rail} strokeWidth={SLAT_WIDTH}>
        {slats.map((x) => {
          const y = profile.find((point) => point.x >= x)?.y ?? groundY;
          return <line key={x} x1={x} y1={y} x2={x} y2={groundY} />;
        })}
      </g>
    </g>
  );
}

export function PosterRail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path d={path} fill="none" stroke={palette?.steel} strokeWidth={STRIPE_WIDTH} transform={`translate(0 ${STRIPE_GAP})`} />
      <path d={path} fill="none" stroke={palette?.skyTop} strokeWidth={STRIPE_WIDTH} transform={`translate(0 ${STRIPE_GAP * 2})`} />
      <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={STRIPE_WIDTH + 2} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
