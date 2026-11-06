/**
 * Pure placement of the user's ride title at the top of the drawing.
 * It shrinks long titles to fit, and widens the canvas when even the smallest size would not.
 * An empty title returns the track untouched, so no blank space is added.
 */
import type { Track } from "./types";

export const MAX_TITLE_LENGTH = 50;

const TITLE_BAND = 72;
const TITLE_BASELINE = 46;
const TITLE_INSET = 24;
const LARGEST_FONT_SIZE = 30;
const SMALLEST_FONT_SIZE = 18;
/** Rough glyph widths as a share of the font size. Scripts like Chinese use full-width glyphs. */
const NARROW_GLYPH_WIDTH = 0.62;
const WIDE_GLYPH_WIDTH = 1.1;
const FIRST_WIDE_CODE_POINT = 0x1100;

function estimateWidthPerFontSize(text: string): number {
  return Array.from(text).reduce((total, glyph) => {
    const isWide = (glyph.codePointAt(0) ?? 0) >= FIRST_WIDE_CODE_POINT;
    return total + (isWide ? WIDE_GLYPH_WIDTH : NARROW_GLYPH_WIDTH);
  }, 0);
}

export function addTitle(track: Track, title: string): Track {
  const text = title.trim();
  if (text === "") {
    return track;
  }
  const widthPerFontSize = estimateWidthPerFontSize(text);
  const fittingSize = (track.width - TITLE_INSET * 2) / widthPerFontSize;
  const fontSize = Math.max(SMALLEST_FONT_SIZE, Math.min(LARGEST_FONT_SIZE, fittingSize));
  return {
    ...track,
    width: Math.max(track.width, Math.ceil(widthPerFontSize * fontSize + TITLE_INSET * 2)),
    height: track.height + TITLE_BAND,
    contentOffset: TITLE_BAND,
    title: { text, fontSize, x: TITLE_INSET, y: TITLE_BASELINE },
  };
}
