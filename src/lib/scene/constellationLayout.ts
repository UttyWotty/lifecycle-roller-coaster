/**
 * Pure layout for the Constellation world: how each stop shines as a star and how the stars are joined.
 * A star grows with the moment's impact and takes a tone from its feeling.
 * Lines join neighbouring stops of the same chapter, so each chapter is its own figure, bridged to the next.
 */
import type { EventSentiment } from "@/lib/events/schema";
import type { ChapterBand, TrackPoint, TrackStop } from "@/lib/track/types";

export type StarTone = "warm" | "cool" | "white";

export interface StarSpot {
  id: string;
  x: number;
  y: number;
  /** Reach of the sparkle's points from its centre. */
  radius: number;
  tone: StarTone;
}

export interface StarLink {
  from: TrackPoint;
  to: TrackPoint;
  /** False where the line crosses from one chapter to the next. */
  isSameChapter: boolean;
}

const STAR_BASE_RADIUS = 16;
const STAR_RADIUS_PER_IMPACT = 2;
const TONES: Readonly<Record<EventSentiment, StarTone>> = { positive: "warm", negative: "cool", neutral: "white" };
/** A stop outside every chapter belongs to none. */
const NO_CHAPTER = -1;

export function starsFor(stops: readonly TrackStop[]): StarSpot[] {
  return stops.map(({ id, x, y, impact, sentiment }) => ({
    id,
    x,
    y,
    radius: STAR_BASE_RADIUS + impact * STAR_RADIUS_PER_IMPACT,
    tone: TONES[sentiment],
  }));
}

function chapterOf(x: number, chapters: readonly ChapterBand[]): number {
  return chapters.findIndex(({ start, end }) => x >= start && x <= end);
}

/** Lines between neighbouring stops, marked as within one chapter or bridging two. */
export function starLinks(stops: readonly TrackStop[], chapters: readonly ChapterBand[]): StarLink[] {
  const ordered = [...stops].sort((a, b) => a.x - b.x);
  return ordered.slice(1).map((stop, index) => {
    const previous = ordered[index];
    const chapter = chapterOf(previous.x, chapters);
    const isSameChapter = chapters.length === 0 || (chapter !== NO_CHAPTER && chapter === chapterOf(stop.x, chapters));
    return { from: { x: previous.x, y: previous.y }, to: { x: stop.x, y: stop.y }, isSameChapter };
  });
}
