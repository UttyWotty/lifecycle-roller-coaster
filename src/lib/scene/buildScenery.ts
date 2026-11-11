/**
 * Pure generator for the scenery behind a ride: clouds, buildings, stars and each theme's landmarks.
 * It also chooses where the balloon and parachute go, from the best and hardest moments.
 * It uses a fixed seed, so the same ride always gets the same scene and never flickers when redrawn.
 */
import type { Track, TrackPoint, TrackStop } from "@/lib/track/types";
import { type Box, boxesOverlap, isTallStop, labelBox } from "./labelLayout";
import { type Planet, placePlanets } from "./placePlanets";
import type { ScenePalette, SceneryKind } from "./themes";

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
  /** Space only, in canvas coordinates, clear of every label. */
  planets: Planet[];
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
const KINDS_WITHOUT_MARKERS: readonly SceneryKind[] = ["line", "space", "arcade", "garden", "constellation", "river", "storybook", "comic"];
const MARKER_SIDE_OFFSETS = [85, -85, 150, -150, 0];
const MARKER_LIFTS = [150, 200, 250, 110, 300];
const MARKER_TOP = 70;
const MARKER_EDGE = 60;
/** The space the balloon or parachute covers around its anchor point, including ropes and basket. */
const MARKER_HALF_WIDTH = 46;
const MARKER_REACH_UP = 52;
const MARKER_REACH_DOWN = 72;
/** Markers only appear in themes with flags and pills, never in metro or bare-text modes. */
const MARKER_LABEL_OPTIONS = { isStation: false, isBare: false } as const;

const NO_MARKERS = { balloon: null, parachute: null } as const;

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

/** The area a balloon or parachute covers, from the top of its canopy to its basket. */
export function markerBox({ x, y }: TrackPoint): Box {
  return {
    x: x - MARKER_HALF_WIDTH,
    y: y - MARKER_REACH_UP,
    width: MARKER_HALF_WIDTH * 2,
    height: MARKER_REACH_UP + MARKER_REACH_DOWN,
  };
}

function markerCandidates(stop: TrackStop, track: Track): TrackPoint[] {
  const top = MARKER_TOP - track.contentOffset;
  return MARKER_LIFTS.flatMap((lift) =>
    MARKER_SIDE_OFFSETS.map((offset) => ({
      x: Math.min(Math.max(stop.x + offset, MARKER_EDGE), track.width - MARKER_EDGE),
      y: Math.max(stop.y - lift, top),
    })),
  );
}

/** Every label on the ride, so a balloon or parachute never hides one. */
export function stopLabelBoxes(track: Track): Box[] {
  return track.stops.map((stop, index) =>
    labelBox(stop, isTallStop(index, track.stops.length), MARKER_LABEL_OPTIONS),
  );
}

/** The first spot beside the stop that keeps clear of every label and earlier marker, or the usual spot if none is clear. */
function markerBeside(stop: TrackStop | null, track: Track, avoid: readonly Box[]): TrackPoint | null {
  if (stop === null) {
    return null;
  }
  const candidates = markerCandidates(stop, track);
  const isClear = (point: TrackPoint): boolean => avoid.every((box) => !boxesOverlap(markerBox(point), box));
  return candidates.find(isClear) ?? candidates[0];
}

function placeMarkers(track: Track): Pick<Scenery, "balloon" | "parachute"> {
  const labels = stopLabelBoxes(track);
  const balloon = markerBeside(strongestStop(track.stops, "positive"), track, labels);
  const taken = balloon === null ? labels : [...labels, markerBox(balloon)];
  return { balloon, parachute: markerBeside(strongestStop(track.stops, "negative"), track, taken) };
}

export function buildScenery(track: Track, palette: ScenePalette): Scenery {
  const random = createRandom();
  const { kind, hasStars, orb } = palette;
  const hasMarkers = track.style !== "metro" && !KINDS_WITHOUT_MARKERS.includes(kind);
  const clouds = buildClouds(track, random);
  return {
    clouds,
    skylineFar: kind === "fairground" ? [] : buildSkyline(track, FAR_HEIGHT_SHARE_MIN, FAR_HEIGHT_SHARE_RANGE, random),
    skylineNear: buildSkyline(track, NEAR_HEIGHT_SHARE_MIN, NEAR_HEIGHT_SHARE_RANGE, random),
    stars: hasStars ? buildStars(track, random) : [],
    orb: orb === null ? null : { x: track.width * ORB_X_SHARE, y: ORB_Y, radius: ORB_RADIUS },
    wheels: kind === "fairground" ? buildWheels(track) : [],
    bats: kind === "haunted" ? buildBats(track, random) : [],
    planets: kind === "space" ? placePlanets(track, clouds) : [],
    ...(hasMarkers ? placeMarkers(track) : NO_MARKERS),
  };
}
