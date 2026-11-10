/**
 * Pure layout of the story picture: a portrait card, sized for phone stories, that carries a ride for sharing.
 * It wraps a long ride onto up to four rows cut halfway between stops, so the drawing stays large on a tall screen.
 * It adds the title, a line of years and stops, and where to make your own, and works on markup only, with no DOM.
 */
import type { LifeEvent } from "@/lib/events/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
const SIDE_MARGIN = 60;
const HEADER_HEIGHT = 380;
const FOOTER_HEIGHT = 200;
const ROW_GAP = 36;
const MAX_ROWS = 4;
/** A row needs a few stops to read as a ride, so short rides stay on one row. */
const MIN_STOPS_PER_ROW = 3;
/** A short ride is enlarged at most this much, so its labels never look blown up. */
const MAX_DRAWING_SCALE = 1.6;
const TITLE_SIZE = 76;
const TITLE_LINE_HEIGHT = 92;
const TITLE_TOP = 150;
const MAX_TITLE_LINES = 2;
const ELLIPSIS = "...";
const SUBTITLE_SIZE = 40;
const SUBTITLE_GAP = 70;
const FOOTER_SIZE = 36;
const FOOTER_BASELINE = STORY_HEIGHT - 90;
export const FONT_FAMILY = "Arial, Helvetica, sans-serif";
/** Card colours, shared with the ride video so both look like one brand. */
export const STORY_COLORS = { card: "#fff7ed", title: "#171717", muted: "#5b5b66", accent: "#e11d48" };
const COLORS = STORY_COLORS;
/** The English title of an unnamed ride; titleLines uses the chosen language's own. */
export const UNNAMED_STORY_TITLE = translate(DEFAULT_LOCALE, "ride.unnamedTitle");
const YEAR_DIGITS = 4;
const ROOT_TAG = /^[\s\S]*?<svg\b[^>]*>/;
const CLOSING_TAG = /<\/svg>\s*$/;

/** Width in pixels of text drawn at the title size and weight; the browser measures it with the real font. */
export type TextMeasure = (text: string) => number;

/** The font the title is drawn in, for measuring it the same way. */
export const STORY_TITLE_FONT = `700 ${TITLE_SIZE}px ${FONT_FAMILY}`;

export interface StoryDrawing {
  width: number;
  height: number;
  /** The drawing's own title strip at the top, which the card leaves out because it shows the title itself. */
  titleBand: number;
  stopXs: readonly number[];
}

export interface StoryRow {
  fromX: number;
  toX: number;
}

export interface StoryLayout {
  rows: StoryRow[];
  scale: number;
}

export interface StoryCardInput {
  /** The ride drawing as standalone markup, already in the export palette. */
  markup: string;
  drawing: StoryDrawing;
  title: string;
  events: readonly LifeEvent[];
  /** The site address shown at the bottom, such as "example.com". */
  host: string;
  measureTitle: TextMeasure;
  /** The language the card's own words are in; English (DEFAULT_LOCALE) when left out. */
  locale?: Locale;
}

/** The width a title line may take on the story card; other layouts pass their own. */
export const STORY_CONTENT_WIDTH = STORY_WIDTH - SIDE_MARGIN * 2;
const CONTENT_WIDTH = STORY_CONTENT_WIDTH;
const CONTENT_HEIGHT = STORY_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;

/** Cuts the drawing into a number of rows of about equal width, each cut halfway between two neighbouring stops. */
export function storyRows(drawing: StoryDrawing, count: number): StoryRow[] {
  const xs = [...drawing.stopXs].sort((a, b) => a - b);
  const candidates = xs.slice(1).map((x, index) => (xs[index] + x) / 2);
  const cuts: number[] = [];
  for (let row = 1; row < count; row += 1) {
    const target = (drawing.width * row) / count;
    const previous = cuts.at(-1) ?? 0;
    const options = candidates.filter((cut) => cut > previous);
    const best = options.reduce<number | null>(
      (nearest, cut) => (nearest === null || Math.abs(cut - target) < Math.abs(nearest - target) ? cut : nearest),
      null,
    );
    if (best === null) {
      break;
    }
    cuts.push(best);
  }
  const edges = [0, ...cuts, drawing.width];
  return edges.slice(1).map((toX, index) => ({ fromX: edges[index], toX }));
}

function scaleFor(drawing: StoryDrawing, rows: readonly StoryRow[]): number {
  const widest = Math.max(...rows.map(({ fromX, toX }) => toX - fromX));
  const visibleHeight = drawing.height - drawing.titleBand;
  const byWidth = CONTENT_WIDTH / widest;
  const byHeight = (CONTENT_HEIGHT - ROW_GAP * (rows.length - 1)) / (visibleHeight * rows.length);
  return Math.min(byWidth, byHeight, MAX_DRAWING_SCALE);
}

/** The number of rows that shows the drawing largest, and the scale it is drawn at. */
export function storyLayout(drawing: StoryDrawing): StoryLayout {
  let best: StoryLayout = { rows: storyRows(drawing, 1), scale: scaleFor(drawing, storyRows(drawing, 1)) };
  for (let count = 2; count <= MAX_ROWS; count += 1) {
    const rows = storyRows(drawing, count);
    const scale = scaleFor(drawing, rows);
    const isWorthIt = rows.every(({ fromX, toX }) => drawing.stopXs.filter((x) => x > fromX && x < toX).length >= MIN_STOPS_PER_ROW);
    if (rows.length === count && isWorthIt && scale > best.scale) {
      best = { rows, scale };
    }
  }
  return best;
}

export function escapeXml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** Whole characters as people see them, so an emoji or accented letter is never cut in half. */
function characters(text: string): string[] {
  return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), ({ segment }) => segment);
}

/** Splits a word too wide for one line into pieces that each fit, at whole characters. */
function fittingPieces(word: string, measure: TextMeasure, maxWidth: number): string[] {
  const pieces: string[] = [];
  let piece = "";
  for (const character of characters(word)) {
    if (piece !== "" && measure(piece + character) > maxWidth) {
      pieces.push(piece);
      piece = "";
    }
    piece += character;
  }
  return piece === "" ? pieces : [...pieces, piece];
}

/** Shortens a line at whole characters until it fits with an ellipsis after it. */
function withEllipsis(line: string, measure: TextMeasure, maxWidth: number): string {
  const kept = characters(line);
  while (kept.length > 0 && measure(`${kept.join("").trimEnd()}${ELLIPSIS}`) > maxWidth) {
    kept.pop();
  }
  return `${kept.join("").trimEnd()}${ELLIPSIS}`;
}

/**
 * Splits a title into at most two lines no wider than maxWidth, measured at the title size, and marks a cut title.
 * A blank title becomes the unnamed ride's title in the given language, English (DEFAULT_LOCALE) unless one is passed.
 */
export function titleLines(title: string, measure: TextMeasure, maxWidth: number, locale: Locale = DEFAULT_LOCALE): string[] {
  const words = (title.trim() || translate(locale, "ride.unnamedTitle")).split(/\s+/).flatMap((word) => fittingPieces(word, measure, maxWidth));
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (current !== undefined && measure(`${current} ${word}`) <= maxWidth) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else {
      lines.push(word);
    }
  }
  if (lines.length <= MAX_TITLE_LINES) {
    return lines;
  }
  const kept = lines.slice(0, MAX_TITLE_LINES);
  kept[MAX_TITLE_LINES - 1] = withEllipsis(kept[MAX_TITLE_LINES - 1], measure, maxWidth);
  return kept;
}

/** "2009 to 2025, 12 stops", or only the stops when no event has a date, in the given language (English by default). */
export function storySubtitle(events: readonly LifeEvent[], locale: Locale = DEFAULT_LOCALE): string {
  const years = events.flatMap((event) => (event.date === null ? [] : [Number(event.date.slice(0, YEAR_DIGITS))]));
  const stops = translate(locale, events.length === 1 ? "pictures.oneStop" : "pictures.manyStops", { count: events.length });
  if (years.length === 0) {
    return stops;
  }
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last
    ? translate(locale, "pictures.subtitleYear", { year: first, stops })
    : translate(locale, "pictures.subtitleYears", { first, last, stops });
}

function drawingRows(input: StoryCardInput, layout: StoryLayout): string {
  const inner = input.markup.replace(ROOT_TAG, "").replace(CLOSING_TAG, "");
  const visibleHeight = input.drawing.height - input.drawing.titleBand;
  const rowHeight = visibleHeight * layout.scale;
  const total = rowHeight * layout.rows.length + ROW_GAP * (layout.rows.length - 1);
  const top = HEADER_HEIGHT + (CONTENT_HEIGHT - total) / 2;
  return layout.rows
    .map(({ fromX, toX }, index) => {
      const width = (toX - fromX) * layout.scale;
      const x = (STORY_WIDTH - width) / 2;
      const y = top + index * (rowHeight + ROW_GAP);
      const viewBox = `${fromX} ${input.drawing.titleBand} ${toX - fromX} ${visibleHeight}`;
      return `<svg x="${x}" y="${y}" width="${width}" height="${rowHeight}" viewBox="${viewBox}" preserveAspectRatio="none">${inner}</svg>`;
    })
    .join("");
}

/** The whole story picture as standalone SVG markup, STORY_WIDTH by STORY_HEIGHT. */
export function buildStoryCard(input: StoryCardInput): string {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const lines = titleLines(input.title, input.measureTitle, STORY_CONTENT_WIDTH, locale);
  const title = lines
    .map((line, index) => `<tspan x="${STORY_WIDTH / 2}" y="${TITLE_TOP + index * TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`)
    .join("");
  const subtitleY = TITLE_TOP + (lines.length - 1) * TITLE_LINE_HEIGHT + SUBTITLE_GAP;
  const middle = STORY_WIDTH / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_WIDTH}" height="${STORY_HEIGHT}" ` +
    `viewBox="0 0 ${STORY_WIDTH} ${STORY_HEIGHT}" font-family="${FONT_FAMILY}">` +
    `<rect width="${STORY_WIDTH}" height="${STORY_HEIGHT}" fill="${COLORS.card}"/>` +
    `<text text-anchor="middle" font-size="${TITLE_SIZE}" font-weight="700" fill="${COLORS.title}">${title}</text>` +
    `<text x="${middle}" y="${subtitleY}" text-anchor="middle" font-size="${SUBTITLE_SIZE}" fill="${COLORS.muted}">` +
    `${escapeXml(storySubtitle(input.events, locale))}</text>` +
    drawingRows(input, storyLayout(input.drawing)) +
    `<text x="${middle}" y="${FOOTER_BASELINE}" text-anchor="middle" font-size="${FOOTER_SIZE}" fill="${COLORS.accent}" ` +
    `font-weight="700">${escapeXml(translate(locale, "pictures.storyFooter", { host: input.host }))}</text>` +
    `</svg>`
  );
}
