/**
 * Pure layout of the printable poster: a landscape A3 page with the ride's title, its years and stops, the whole drawing
 * and the wordmark. It is laid out in tenths of a millimetre, so print sizes stay exact.
 * It chooses the pixel scale for print resolution, held under a canvas limit that phones can paint, and returns markup only.
 */
import type { LifeEvent } from "@/lib/events/schema";
import {
  FONT_FAMILY,
  STORY_COLORS,
  escapeXml,
  storySubtitle,
  titleLines,
  type StoryDrawing,
  type TextMeasure,
} from "./storyCard";

/** A3 landscape, in tenths of a millimetre. */
export const POSTER_WIDTH = 4200;
export const POSTER_HEIGHT = 2970;
const MILLIMETRES_PER_INCH = 25.4;
const UNITS_PER_MILLIMETRE = 10;
/** Print resolution, held lower only where the canvas limit requires it. */
const PRINT_DPI = 300;
/** The most pixels a canvas may hold and still be painted on phones, which refuse larger ones. */
export const MAX_CANVAS_PIXELS = 16_000_000;
const MARGIN = 200;
export const POSTER_TITLE_SIZE = 180;
const TITLE_LINE_HEIGHT = 210;
const SUBTITLE_SIZE = 80;
const SUBTITLE_GAP = 130;
const HEADER_GAP = 120;
const FOOTER_SIZE = 60;
const FOOTER_HEIGHT = 160;
/** The poster is printed, so its footer names the app rather than linking to it. */
const WORDMARK = "Lifecycle Roller Coaster";
const HALF = 2;
const ROOT_TAG = /^[\s\S]*?<svg\b[^>]*>/;
const CLOSING_TAG = /<\/svg>\s*$/;

/** The font the poster's title is drawn in, for measuring it the same way. */
export const POSTER_TITLE_FONT = `700 ${POSTER_TITLE_SIZE}px ${FONT_FAMILY}`;
export const POSTER_TEXT_WIDTH = POSTER_WIDTH - MARGIN * HALF;
export const POSTER_FILE_NAME = "my-roller-coaster-poster.png";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PosterInput {
  /** The drawing's export markup, already in the export palette. */
  markup: string;
  drawing: StoryDrawing;
  title: string;
  events: readonly LifeEvent[];
  measureTitle: TextMeasure;
}

/** Pixels per poster unit: print resolution, or less where that would pass the canvas limit. */
export function posterScale(): number {
  const printScale = PRINT_DPI / MILLIMETRES_PER_INCH / UNITS_PER_MILLIMETRE;
  const limitScale = Math.sqrt(MAX_CANVAS_PIXELS / (POSTER_WIDTH * POSTER_HEIGHT));
  return Math.min(printScale, limitScale);
}

/** Where the drawing goes: as large as fits between the header and footer, keeping its proportions, centred. */
export function drawingBox(drawing: StoryDrawing, headerBottom: number): Box {
  const visibleHeight = drawing.height - drawing.titleBand;
  const area = { x: MARGIN, y: headerBottom + HEADER_GAP, width: POSTER_TEXT_WIDTH, height: POSTER_HEIGHT - FOOTER_HEIGHT - MARGIN - headerBottom - HEADER_GAP };
  const scale = Math.min(area.width / drawing.width, area.height / visibleHeight);
  const width = drawing.width * scale;
  const height = visibleHeight * scale;
  return { x: area.x + (area.width - width) / HALF, y: area.y + (area.height - height) / HALF, width, height };
}

/** The whole poster as standalone SVG markup, POSTER_WIDTH by POSTER_HEIGHT units. */
export function buildPoster(input: PosterInput): string {
  const middle = POSTER_WIDTH / HALF;
  const lines = titleLines(input.title, input.measureTitle, POSTER_TEXT_WIDTH);
  const titleTop = MARGIN + POSTER_TITLE_SIZE;
  const title = lines
    .map((line, index) => `<tspan x="${middle}" y="${titleTop + index * TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`)
    .join("");
  const subtitleY = titleTop + (lines.length - 1) * TITLE_LINE_HEIGHT + SUBTITLE_GAP;
  const box = drawingBox(input.drawing, subtitleY);
  const inner = input.markup.replace(ROOT_TAG, "").replace(CLOSING_TAG, "");
  const viewBox = `0 ${input.drawing.titleBand} ${input.drawing.width} ${input.drawing.height - input.drawing.titleBand}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" ` +
    `viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" font-family="${FONT_FAMILY}">` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="${STORY_COLORS.card}"/>` +
    `<text text-anchor="middle" font-size="${POSTER_TITLE_SIZE}" font-weight="700" fill="${STORY_COLORS.title}">${title}</text>` +
    `<text x="${middle}" y="${subtitleY}" text-anchor="middle" font-size="${SUBTITLE_SIZE}" fill="${STORY_COLORS.muted}">` +
    `${escapeXml(storySubtitle(input.events))}</text>` +
    `<svg x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" viewBox="${viewBox}">${inner}</svg>` +
    `<text x="${middle}" y="${POSTER_HEIGHT - MARGIN}" text-anchor="middle" font-size="${FOOTER_SIZE}" ` +
    `font-weight="700" fill="${STORY_COLORS.accent}">${WORDMARK}</text>` +
    `</svg>`
  );
}
