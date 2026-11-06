/**
 * Pure generator for the scenery behind a ride: clouds, buildings, stars and each theme's landmarks.
 * It also chooses where the balloon and parachute go, from the best and hardest moments.
 * It uses a fixed seed, so the same ride always gets the same scene and never flickers when redrawn.
 */
import type { Track, TrackPoint, TrackStop } from "@/lib/track/types";
import type { ScenePalette } from "./themes";

export interface Cloud extends TrackPoint {
  scale: number;
}

export interface Building {
  x: number;
  width: number;
  height: number;
  hasSpire: boolean;
}

export interface Star extends TrackPoint {
  radius: number;
}

export interface Orb extends TrackPoint {
  radius: number;
}

export interface Wheel extends TrackPoint {
  radius: number;
}

export interface Bat extends TrackPoint {
  scale: number;
}

export interface Scenery {
  clouds: Cloud[];
  skylineFar: Building[];
  skylineNear: Building[];
  stars: Star[];
  orb: Orb | null;
  wheels: Wheel[];
  bats: Bat[];
  /** In the same coordinates as the track, so they sit beside their stops. */
  balloon: TrackPoint | null;
  parachute: TrackPoint | null;
}

const SEED = 20261106;
const SEED_MULTIPLIER = 1664525;
const SEED_INCREMENT = 1013904223;
const SEED_MODULUS = 2 ** 32;
const CLOUD_SPACING = 240;
const CLOUD_TOP = 60;
const CLOUD_SKY_SHARE = 0.5;
const CLOUD_SCALE_MIN = 0.7;
const CLOUD_SCALE_RANGE = 0.7;
const BUILDING_WIDTH_MIN = 44;
const BUILDING_WIDTH_RANGE = 56;
const BUILDING_GAP_RANGE = 14;
/** Building heights are shares of the canvas height, so short maps never get skyscrapers. */
const FAR_HEIGHT_SHARE_MIN = 0.42;
const FAR_HEIGHT_SHARE_RANGE = 0.34;
const NEAR_HEIGHT_SHARE_MIN = 0.26;
const NEAR_HEIGHT_SHARE_RANGE = 0.26;
const SPIRE_CHANCE = 0.25;
const STAR_SPACING = 22;
const STAR_SKY_SHARE = 0.7;
const STAR_RADIUS_MIN = 0.8;
const STAR_RADIUS_RANGE = 1.4;
const ORB_X_SHARE = 0.72;
const ORB_Y = 104;
const ORB_RADIUS = 62;
const WHEEL_SPACING = 620;
const WHEEL_HEIGHT_SHARE = 0.2;
const WHEEL_GROUND_GAP = 30;
const BAT_SPACING = 190;
const BAT_TOP = 40;
const BAT_SKY_SHARE = 0.5;
const BAT_SCALE_MIN = 0.6;
const BAT_SCALE_RANGE = 0.8;
const MARKER_SIDE_OFFSET = 85;
const MARKER_LIFT = 150;
const MARKER_TOP = 70;
const MARKER_EDGE = 60;

function createRandom(): () => number {
  let state = SEED;
  return () => {
    state = (state * SEED_MULTIPLIER + SEED_INCREMENT) % SEED_MODULUS;
    return state / SEED_MODULUS;
  };
}

function buildClouds(track: Track, random: () => number): Cloud[] {
  const count = Math.ceil(track.width / CLOUD_SPACING);
  const skyDepth = track.height * CLOUD_SKY_SHARE - CLOUD_TOP;
  return Array.from({ length: count }, (_, index) => ({
    x: (index + random()) * CLOUD_SPACING,
    y: CLOUD_TOP + random() * skyDepth,
    scale: CLOUD_SCALE_MIN + random() * CLOUD_SCALE_RANGE,
  }));
}

function buildSkyline(
  track: Track,
  minHeightShare: number,
  heightShareRange: number,
  random: () => number,
): Building[] {
  const { width, height } = track;
  const buildings: Building[] = [];
  for (let x = 0; x < width; ) {
    const buildingWidth = Math.min(
      BUILDING_WIDTH_MIN + random() * BUILDING_WIDTH_RANGE,
      width - x,
    );
    buildings.push({
      x,
      width: buildingWidth,
      height: (minHeightShare + random() * heightShareRange) * height,
      hasSpire: random() < SPIRE_CHANCE,
    });
    x += buildingWidth + random() * BUILDING_GAP_RANGE;
  }
  return buildings;
}

function buildStars(track: Track, random: () => number): Star[] {
  const count = Math.ceil(track.width / STAR_SPACING);
  return Array.from({ length: count }, () => ({
    x: random() * track.width,
    y: random() * track.height * STAR_SKY_SHARE,
    radius: STAR_RADIUS_MIN + random() * STAR_RADIUS_RANGE,
  }));
}

function buildWheels({ width, height }: Track): Wheel[] {
  const radius = height * WHEEL_HEIGHT_SHARE;
  return Array.from({ length: Math.ceil(width / WHEEL_SPACING) }, (_, index) => ({
    x: (index + 0.5) * WHEEL_SPACING,
    y: height - radius - WHEEL_GROUND_GAP,
    radius,
  })).filter(({ x }) => x + radius <= width);
}

function buildBats(track: Track, random: () => number): Bat[] {
  const count = Math.ceil(track.width / BAT_SPACING);
  const skyDepth = track.height * BAT_SKY_SHARE - BAT_TOP;
  return Array.from({ length: count }, (_, index) => ({
    x: (index + random()) * BAT_SPACING,
    y: BAT_TOP + random() * skyDepth,
    scale: BAT_SCALE_MIN + random() * BAT_SCALE_RANGE,
  }));
}

/** The first stop with the highest impact among those with the given feeling. */
function strongestStop(stops: readonly TrackStop[], sentiment: TrackStop["sentiment"]): TrackStop | null {
  return stops
    .filter((stop) => stop.sentiment === sentiment)
    .reduce<TrackStop | null>((best, stop) => (best && best.impact >= stop.impact ? best : stop), null);
}

function markerBeside(stop: TrackStop | null, track: Track): TrackPoint | null {
  if (stop === null) {
    return null;
  }
  return {
    x: Math.min(stop.x + MARKER_SIDE_OFFSET, track.width - MARKER_EDGE),
    y: Math.max(stop.y - MARKER_LIFT, MARKER_TOP - track.contentOffset),
  };
}

export function buildScenery(track: Track, palette: ScenePalette): Scenery {
  const random = createRandom();
  const { kind, hasStars, orb } = palette;
  const hasMarkers = track.style !== "metro" && kind !== "line";
  return {
    clouds: buildClouds(track, random),
    skylineFar: kind === "fairground" ? [] : buildSkyline(track, FAR_HEIGHT_SHARE_MIN, FAR_HEIGHT_SHARE_RANGE, random),
    skylineNear: buildSkyline(track, NEAR_HEIGHT_SHARE_MIN, NEAR_HEIGHT_SHARE_RANGE, random),
    stars: hasStars ? buildStars(track, random) : [],
    orb: orb === null ? null : { x: track.width * ORB_X_SHARE, y: ORB_Y, radius: ORB_RADIUS },
    wheels: kind === "fairground" ? buildWheels(track) : [],
    bats: kind === "haunted" ? buildBats(track, random) : [],
    balloon: hasMarkers ? markerBeside(strongestStop(track.stops, "positive"), track) : null,
    parachute: hasMarkers ? markerBeside(strongestStop(track.stops, "negative"), track) : null,
  };
}
