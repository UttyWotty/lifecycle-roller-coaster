/**
 * Pure placement of life chapters as bands along the bottom of a ride.
 * A chapter spans the stops it still has, so deleting events shrinks it, and an empty chapter is dropped.
 * With no chapters the track is returned untouched, so no blank space is added.
 */
import type { LifeChapter } from "@/lib/events/insights";
import type { ChapterBand, Track } from "./types";

export const CHAPTER_BAND_HEIGHT = 46;

const BAND_PADDING = 62;

export function addChapters(track: Track, chapters: readonly LifeChapter[]): Track {
  const bands = chapters.flatMap(({ title, eventIds }): ChapterBand[] => {
    const xs = track.stops.filter(({ id }) => eventIds.includes(id)).map(({ x }) => x);
    if (xs.length === 0) {
      return [];
    }
    const start = Math.max(Math.min(...xs) - BAND_PADDING, 0);
    const end = Math.min(Math.max(...xs) + BAND_PADDING, track.width);
    return [{ title, start, end }];
  });
  if (bands.length === 0) {
    return track;
  }
  return { ...track, height: track.height + CHAPTER_BAND_HEIGHT, chapterBands: bands };
}
