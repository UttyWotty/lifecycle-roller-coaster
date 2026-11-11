/**
 * Pure helper that turns a ride's chapters into spans covering the whole drawing from left to right.
 * Chapters are put in order and stretched to meet, with the first reaching the left edge and the last the right.
 * Worlds that change with each chapter, such as the Garden's seasons and the Storybook's pages, build on it.
 */
import type { ChapterBand } from "@/lib/track/types";

export interface ChapterSpan {
  from: number;
  to: number;
  /** The chapter's place in order, from 0; a ride with no chapters is one span numbered 0. */
  index: number;
}

export function chapterSpans(chapters: readonly ChapterBand[], width: number): ChapterSpan[] {
  const sorted = [...chapters].sort((a, b) => a.start - b.start);
  if (sorted.length === 0) {
    return [{ from: 0, to: width, index: 0 }];
  }
  return sorted.map((chapter, index) => ({
    from: index === 0 ? 0 : chapter.start,
    to: index === sorted.length - 1 ? width : sorted[index + 1].start,
    index,
  }));
}
