/**
 * Pure list of the parts of a ride drawing that the story picture must never cut when it wraps the ride onto rows.
 * Stop labels, chapter names, Nightmare Mode's neon signs and the balloon and parachute each become a horizontal span,
 * placed with the same rules the drawing uses. The story card prefers row cuts outside every span.
 */
import { markerBox } from "@/lib/scene/buildScenery";
import type { Scene } from "@/lib/scene/composeRide";
import { SIGN_WIDTH, neonSignPositions } from "@/lib/scene/neonSigns";
import type { SceneryKind } from "@/lib/scene/themes";
import { CHAPTER_CHARACTER_WIDTH } from "@/lib/track/rideChapters";
import { labelWidth } from "@/lib/track/labelWidth";
import type { Track } from "@/lib/track/types";

export interface Span {
  from: number;
  to: number;
}

const HALF = 2;
const NEON_KIND: SceneryKind = "neon";

/** The span of a chapter name, centred in its band and never wider than the band. */
function chapterNameSpan(title: string, start: number, end: number): Span {
  const width = Math.min(title.length * CHAPTER_CHARACTER_WIDTH, end - start);
  const middle = (start + end) / HALF;
  return { from: middle - width / HALF, to: middle + width / HALF };
}

/** The balloon, the parachute and, in Nightmare Mode, the neon signs; a plain drawing (no scene) has none. */
function scenerySpans(track: Track, scene: Scene | null): Span[] {
  if (scene === null) {
    return [];
  }
  const { balloon, parachute } = scene.scenery;
  const markers = [balloon, parachute].flatMap((marker) => {
    if (marker === null) {
      return [];
    }
    const box = markerBox(marker);
    return [{ from: box.x, to: box.x + box.width }];
  });
  const signs = scene.palette.kind === NEON_KIND ? neonSignPositions(track, scene.scenery).map(({ x }) => ({ from: x, to: x + SIGN_WIDTH })) : [];
  return [...markers, ...signs];
}

/** What a row cut should not pass through: the ride's own words first, then scenery, which matters less. */
export interface KeepWhole {
  /** Stop labels and chapter names. */
  words: Span[];
  /** The balloon, the parachute and Nightmare Mode's neon signs. */
  scenery: Span[];
}

/** Every stop label and chapter name, and every scenery piece, as spans a row cut should not pass through. */
export function keepWholeSpans(track: Track, scene: Scene | null): KeepWhole {
  const labels = track.stops.map(({ x, title, date }) => {
    const half = labelWidth(title, date) / HALF;
    return { from: x - half, to: x + half };
  });
  const chapters = track.chapterBands.map(({ title, start, end }) => chapterNameSpan(title, start, end));
  return { words: [...labels, ...chapters], scenery: scenerySpans(track, scene) };
}

/** True when a cut at x would split the span. */
export function cutsThrough(x: number, span: Span): boolean {
  return x > span.from && x < span.to;
}
