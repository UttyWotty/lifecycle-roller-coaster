/**
 * Pure placement of life chapters as bands along the bottom of a ride.
 * A chapter spans the stops it still has, so deleting events shrinks it, and an empty chapter is dropped.
 * Stops are grouped in ride order, so a chapter split by reordering becomes separate bands that never overlap.
 * With no chapters the track is returned untouched, so no blank space is added.
 */
import type { LifeChapter } from "@/lib/events/insights";
import type { ChapterBand, Track } from "./types";

export const CHAPTER_BAND_HEIGHT = 46;
/** Estimated width of one character of a chapter name as the bands draw it, used to shorten and place names. */
export const CHAPTER_CHARACTER_WIDTH = 8;

const BAND_PADDING = 62;

interface ChapterRun {
  title: string;
  first: number;
  last: number;
}

/** Groups neighbouring stops that belong to the same chapter, in the order the ride shows them. */
function chapterRuns(track: Track, chapters: readonly LifeChapter[]): ChapterRun[] {
  const runs: ChapterRun[] = [];
  track.stops.forEach(({ id }, index) => {
    const chapter = chapters.find(({ eventIds }) => eventIds.includes(id));
    const current = runs.at(-1);
    if (chapter === undefined) {
      return;
    }
    if (current && current.title === chapter.title && current.last === index - 1) {
      current.last = index;
    } else {
      runs.push({ title: chapter.title, first: index, last: index });
    }
  });
  return runs;
}

/** A band reaches past its outer stops, but never beyond halfway to a neighbouring stop or off the canvas. */
function bandFor({ title, first, last }: ChapterRun, track: Track): ChapterBand {
  const { stops, width } = track;
  const before = stops[first - 1];
  const after = stops[last + 1];
  const startLimit = before ? (before.x + stops[first].x) / 2 : 0;
  const endLimit = after ? (stops[last].x + after.x) / 2 : width;
  return {
    title,
    start: Math.max(stops[first].x - BAND_PADDING, startLimit),
    end: Math.min(stops[last].x + BAND_PADDING, endLimit),
  };
}

export function addChapters(track: Track, chapters: readonly LifeChapter[]): Track {
  const bands = chapterRuns(track, chapters).map((run) => bandFor(run, track));
  if (bands.length === 0) {
    return track;
  }
  return { ...track, height: track.height + CHAPTER_BAND_HEIGHT, chapterBands: bands };
}
