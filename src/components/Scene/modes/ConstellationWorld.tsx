/**
 * Constellation world: a life drawn as a figure of stars across a midnight sky, one figure for each chapter.
 * Each moment shines as a star, bigger for bigger moments and warm, cool or white by feeling, and a comet rides the trail.
 * All shapes are original and built from the ride's own geometry, with placement from the pure constellationLayout module.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import { starLinks, starsFor, type StarTone } from "@/lib/scene/constellationLayout";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const SKY_ID = "constellation-sky";
/** The scenery's stars fill the top of the sky; spreading them by this much covers all of it, as Space does. */
const STAR_SPREAD = 1 / 0.7;
/** The band of milky light is a few soft layers, widest and faintest outside, so it has no hard edge. */
const MILKY_WAY_LAYERS = [
  { height: 0.2, opacity: 0.04 },
  { height: 0.13, opacity: 0.05 },
  { height: 0.07, opacity: 0.06 },
];
const TONE_COLORS: Readonly<Record<StarTone, string>> = { warm: "#fcd34d", cool: "#93c5fd", white: "#f8fafc" };
/** Two glows around each star: a wide faint one and a small bright one, both in the star's own colour. */
const OUTER_HALO_SHARE = 1.6;
const OUTER_HALO_OPACITY = 0.1;
const INNER_HALO_SHARE = 0.75;
const INNER_HALO_OPACITY = 0.35;
/** How far the sparkle's waist sits from its centre, as a share of its reach. */
const WAIST_SHARE = 0.22;
const LINK_WIDTH = 2;
const LINK_OPACITY = 0.75;
const BRIDGE_OPACITY = 0.35;
const MOON_CUT_SHARE = 0.38;
/** The crescent is cut out with a mask, so the sky shows through it in every export. */
const MOON_MASK_ID = "constellation-moon-cut";

function sparklePath(radius: number): string {
  const waist = radius * WAIST_SHARE;
  return `M0 ${-radius} L${waist} ${-waist} L${radius} 0 L${waist} ${waist} L0 ${radius} L${-waist} ${waist} L${-radius} 0 L${-waist} ${-waist} Z`;
}

export function ConstellationBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <defs>
        <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      <g fill={palette.cloud} transform={`rotate(-6 ${track.width / 2} ${track.height * 0.45})`} data-testid="constellation-milky-way">
        {MILKY_WAY_LAYERS.map(({ height, opacity }) => (
          <ellipse key={height} cx={track.width / 2} cy={track.height * 0.45} rx={track.width * 0.62} ry={track.height * height} opacity={opacity} />
        ))}
      </g>
      {scenery.stars.map(({ x, y, radius }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y * STAR_SPREAD} r={radius * 0.8} fill={palette.pill} opacity={0.8} />
      ))}
      {scenery.orb && (
        <g data-testid="constellation-moon">
          <mask id={MOON_MASK_ID}>
            <circle cx={scenery.orb.x} cy={scenery.orb.y} r={scenery.orb.radius * 0.6} fill="#ffffff" />
            <circle
              cx={scenery.orb.x + scenery.orb.radius * MOON_CUT_SHARE}
              cy={scenery.orb.y - scenery.orb.radius * MOON_CUT_SHARE * 0.5}
              r={scenery.orb.radius * 0.6}
              fill="#000000"
            />
          </mask>
          <circle cx={scenery.orb.x} cy={scenery.orb.y} r={scenery.orb.radius * 0.6} fill={palette.orb ?? palette.pill} mask={`url(#${MOON_MASK_ID})`} />
        </g>
      )}
    </g>
  );
}

export function ConstellationStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const hasFigure = track.style !== "metro";
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      {hasFigure &&
        starLinks(track.stops, track.chapterBands).map(({ from, to, isSameChapter }) => (
          <line
            key={`${from.x}-${to.x}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={palette.steel}
            strokeWidth={LINK_WIDTH}
            strokeLinecap="round"
            strokeDasharray={isSameChapter ? undefined : "2 9"}
            opacity={isSameChapter ? LINK_OPACITY : BRIDGE_OPACITY}
            data-testid={isSameChapter ? "constellation-line" : "constellation-bridge"}
          />
        ))}
      {starsFor(track.stops).map(({ id, x, y, radius, tone }) => (
        <g key={id} transform={`translate(${x} ${y})`} data-testid="constellation-star">
          <circle r={radius * OUTER_HALO_SHARE} fill={TONE_COLORS[tone]} opacity={OUTER_HALO_OPACITY} />
          <circle r={radius * INNER_HALO_SHARE} fill={TONE_COLORS[tone]} opacity={INNER_HALO_OPACITY} />
          <path d={sparklePath(radius)} fill={TONE_COLORS[tone]} />
        </g>
      ))}
    </g>
  );
}

export function ConstellationRail({ path, palette }: RailProps): ReactElement {
  return (
    <path
      d={path}
      pathLength={1}
      fill="none"
      stroke={palette?.rail}
      strokeOpacity={0.4}
      strokeWidth={3}
      strokeLinecap="round"
      className="ride-track-draw"
      data-testid={DRAW_TEST_ID}
    />
  );
}

export function Comet({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g transform="translate(0 -22)">
      <path d="M-14 -16 Q-60 -10 -96 0 Q-60 10 -14 16 Z" fill={color} opacity={0.35} />
      <path d="M-12 -9 Q-46 -6 -70 0 Q-46 6 -12 9 Z" fill="#ffffff" opacity={0.55} />
      <circle r={20} fill={color} stroke="#fff7d6" strokeWidth={3} />
      <g transform="translate(-2 -20) scale(0.8)">
        <RiderArt rider={rider} />
      </g>
    </g>
  );
}
