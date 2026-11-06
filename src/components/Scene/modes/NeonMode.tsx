/**
 * Nightmare Mode: a dramatic neon city at night, with glowing rails, lit towers and signs.
 * A wet floor below the track mirrors the rail, so the whole picture feels charged and chaotic.
 * All shapes are original, and the signs use only the app's own plain words.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track, TrackPoint } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const SKY_ID = "neon-sky";
const WINDOWS_ID = "neon-windows";
const FLOOR_ID = "neon-floor";
const RAIL_GRADIENT_ID = "neon-rail";
const GLOW_ID = "neon-glow";
const WINDOW_CELL_WIDTH = 34;
const WINDOW_CELL_HEIGHT = 46;
const WINDOW_OPACITY = 0.42;
/** The reflection is squashed to fit the wet floor, so the whole ride shows in it. */
const REFLECTION_SQUASH = 0.32;
const POST_OPACITY = 0.6;
const RAIL_WIDTH = 5;
const GLOW_WIDTH = 13;
const SECOND_RAIL_DROP = 11;
const POST_WIDTH = 5;
const POST_SPREAD = 26;
const REFLECTION_OPACITY = 0.75;
const SIGN_MARKER_CLEARANCE = 60;
/** How far under the rail each sign hangs, varied so they do not line up. */
const SIGN_DROPS = [34, 96, 58, 130];
const SIGN_GROUND_GAP = 24;
/** The clear band of sky above the track, where every flag and loop stays below. */
const SIGN_SKY_Y = -112;
/** How far below its stop a label reaches, so signs can stay clear of it. */
const BELOW_LABEL_REACH = 86;
const SIGN_WIDTH = 74;
const SIGN_HEIGHT = 30;
const SIGN_WORDS = ["LIFE", "RIDE", "OPEN", "HIGHS", "LOWS"];

function GlowDefs({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  return (
    <defs>
      <linearGradient id={SKY_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={palette.skyTop} />
        <stop offset="1" stopColor={palette.skyBottom} />
      </linearGradient>
      <linearGradient id={FLOOR_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={palette.steelDark} />
        <stop offset="1" stopColor={palette.ground} />
      </linearGradient>
      <linearGradient id={RAIL_GRADIENT_ID} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={track.width} y2={0} spreadMethod="reflect">
        <stop offset="0" stopColor={palette.rail} />
        <stop offset="0.5" stopColor={palette.cart} />
        <stop offset="1" stopColor={palette.steel} />
      </linearGradient>
      <filter id={GLOW_ID} filterUnits="userSpaceOnUse" x={0} y={-track.height} width={track.width} height={track.height * 3}>
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <pattern id={WINDOWS_ID} width={WINDOW_CELL_WIDTH} height={WINDOW_CELL_HEIGHT} patternUnits="userSpaceOnUse">
        <g opacity={WINDOW_OPACITY}>
          <rect x={4} y={5} width={5} height={8} fill={palette.cloud} />
          <rect x={21} y={13} width={5} height={8} fill={palette.cart} />
          <rect x={12} y={31} width={5} height={8} fill={palette.rail} />
        </g>
      </pattern>
    </defs>
  );
}

function Tower(props: { x: number; width: number; top: number; bottom: number; color: string }): ReactElement {
  const { x, width, top, bottom, color } = props;
  return (
    <g>
      <rect x={x} y={top} width={width} height={bottom - top} fill={color} />
      <rect x={x} y={top} width={width} height={bottom - top} fill={`url(#${WINDOWS_ID})`} />
    </g>
  );
}

function Sign(props: { x: number; y: number; word: string; palette: ScenePalette }): ReactElement {
  const { x, y, word, palette } = props;
  return (
    <g data-testid="neon-sign">
      <rect x={x} y={y} width={SIGN_WIDTH} height={SIGN_HEIGHT} rx={4} fill={palette.cart} filter={`url(#${GLOW_ID})`} />
      <rect x={x} y={y} width={SIGN_WIDTH} height={SIGN_HEIGHT} rx={4} fill={palette.skyTop} stroke={palette.cart} strokeWidth={2.5} />
      <text x={x + SIGN_WIDTH / 2} y={y + 21} textAnchor="middle" fontSize={17} fontWeight={800} fill={palette.title}>
        {word}
      </text>
    </g>
  );
}

/** Signs hang under the rail between stops, or in clear sky when a label is in the way. */
function signPositions(track: Track, scene: Scene): TrackPoint[] {
  if (track.style === "metro") {
    return [];
  }
  const { balloon, parachute } = scene.scenery;
  const markers = [balloon, parachute].flatMap((marker) => (marker ? [marker.x] : []));
  return track.stops.slice(1).flatMap((stop, index) => {
    const middle = (track.stops[index].x + stop.x) / 2;
    const under = track.profile.filter(({ x }) => Math.abs(x - middle) <= SIGN_WIDTH);
    const railBottom = Math.max(...under.map(({ y }) => y));
    const y = railBottom + SIGN_DROPS[index % SIGN_DROPS.length];
    const isTaken = markers.some((x) => Math.abs(x - middle) < SIGN_MARKER_CLEARANCE);
    const fits = y + SIGN_HEIGHT + SIGN_GROUND_GAP <= track.groundY;
    const isUnderLabel = [track.stops[index], stop].some(
      (neighbour) => neighbour.labelSide === "below" && y < neighbour.y + BELOW_LABEL_REACH,
    );
    const signY = fits && !isUnderLabel ? y : SIGN_SKY_Y;
    return isTaken ? [] : [{ x: middle - SIGN_WIDTH / 2, y: signY + track.contentOffset }];
  });
}

export function NeonBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const horizon = track.contentOffset + track.groundY;
  const signs = signPositions(track, scene);
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <GlowDefs track={track} palette={palette} />
      <rect width={track.width} height={track.height} fill={`url(#${SKY_ID})`} data-testid="scene-sky" />
      {scenery.skylineFar.map(({ x, width, height }) => (
        <Tower key={x} x={x} width={width} top={horizon - height} bottom={horizon} color={palette.skylineFar} />
      ))}
      {scenery.skylineNear.map(({ x, width, height }) => (
        <Tower key={x} x={x} width={width} top={horizon - height} bottom={horizon} color={palette.skylineNear} />
      ))}
      {signs.map(({ x, y }, index) => (
        <Sign key={x} x={x} y={y} word={SIGN_WORDS[index % SIGN_WORDS.length]} palette={palette} />
      ))}
      <rect y={horizon} width={track.width} height={track.height - horizon} fill={`url(#${FLOOR_ID})`} />
    </g>
  );
}

export function NeonStructure({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, stops, groundY, lines } = track;
  const rail = lines[0];
  if (profile.length === 0 || rail === undefined) {
    return null;
  }
  return (
    <g aria-hidden="true" data-testid="mode-structure">
      <g transform={`translate(0 ${groundY * (1 + REFLECTION_SQUASH)}) scale(1 ${-REFLECTION_SQUASH})`} opacity={REFLECTION_OPACITY} data-testid="neon-reflection">
        <path d={rail.path} fill="none" stroke={`url(#${RAIL_GRADIENT_ID})`} strokeWidth={GLOW_WIDTH} filter={`url(#${GLOW_ID})`} />
      </g>
      <g stroke={palette.steel} strokeOpacity={POST_OPACITY} strokeWidth={POST_WIDTH}>
        {stops.map(({ id, x, y }) => (
          <g key={id}>
            <line x1={x} y1={y} x2={x - POST_SPREAD} y2={groundY} />
            <line x1={x} y1={y} x2={x + POST_SPREAD} y2={groundY} />
          </g>
        ))}
      </g>
    </g>
  );
}

export function NeonRail({ path }: RailProps): ReactElement {
  const stroke = `url(#${RAIL_GRADIENT_ID})`;
  return (
    <>
      <path d={path} fill="none" stroke={stroke} strokeWidth={GLOW_WIDTH} filter={`url(#${GLOW_ID})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={RAIL_WIDTH} strokeOpacity={0.55} transform={`translate(0 ${SECOND_RAIL_DROP})`} />
      <path d={path} pathLength={1} fill="none" stroke={stroke} strokeWidth={RAIL_WIDTH} strokeLinecap="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
    </>
  );
}
