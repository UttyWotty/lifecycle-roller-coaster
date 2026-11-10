/**
 * Pure preparation of a ride drawing for export as a standalone image.
 * It swaps theme variables for a fixed light palette, so exports look the same in any theme.
 * It works on serialized markup and performs no DOM, canvas or file operations.
 */

/** Elements with this attribute appear on screen but are left out of exported images. */
export const EXPORT_HIDDEN_ATTRIBUTE = "data-export-hidden";

export interface RideImageSize {
  width: number;
  height: number;
}

const EXPORT_PALETTE: Readonly<Record<string, string>> = {
  "--background": "#ffffff",
  "--foreground": "#171717",
  "--muted": "#5b5b66",
  "--accent": "#e11d48",
};
const FALLBACK_COLOR = EXPORT_PALETTE["--foreground"];
const FONT_FAMILY = "Arial, Helvetica, sans-serif";
const WORDMARK = "Lifecycle Roller Coaster";
const WORDMARK_SIZE = 14;
const WORDMARK_INSET = 16;
/**
 * The wordmark sits on its own small badge in the top-right corner, so it reads on dark scenes without a
 * smeared halo and never covers the chapter bands along the bottom or the title on the left.
 */
const WORDMARK_CHARACTER_WIDTH = 7.4;
const WORDMARK_PADDING_X = 10;
const WORDMARK_PADDING_Y = 6;
const WORDMARK_BADGE_RADIUS = 8;
const WORDMARK_BADGE_OPACITY = 0.85;
const WORDMARK_BASELINE_DROP = 0.3;
const PREFERRED_SCALE = 2;
/** Browsers refuse larger canvases, so very long rides are drawn at a lower scale. */
const MAX_CANVAS_EDGE = 8192;

/**
 * Serialized markup escapes "<" in text and attribute values, so every "<...>" span is a tag.
 * Colours are swapped only inside tags, so words in a user's title are never rewritten, even if they look like markup.
 */
const TAG = /<[^>]*>/g;
/** Matches only whole attribute values inside a tag. */
const THEME_VARIABLE = /="var\((--[\w-]+)\)"/g;
const CURRENT_COLOR = /="currentColor"/g;
const ROOT_TAG = /<svg\b([^>]*)>/;
const CLOSING_TAG = "</svg>";

export function exportScale({ width, height }: RideImageSize): number {
  return Math.min(PREFERRED_SCALE, MAX_CANVAS_EDGE / Math.max(width, height));
}

function applyPaletteToTag(tag: string): string {
  return tag
    .replace(THEME_VARIABLE, (_match, name: string) => `="${EXPORT_PALETTE[name] ?? FALLBACK_COLOR}"`)
    .replace(CURRENT_COLOR, `="${FALLBACK_COLOR}"`);
}

/** Where the wordmark badge sits in an image of the given width, in image units before scaling. */
export function wordmarkBadgeBox(width: number): RideImageSize & { x: number; y: number } {
  const badgeWidth = WORDMARK.length * WORDMARK_CHARACTER_WIDTH + WORDMARK_PADDING_X * 2;
  return {
    x: width - WORDMARK_INSET - badgeWidth,
    y: WORDMARK_INSET,
    width: badgeWidth,
    height: WORDMARK_SIZE + WORDMARK_PADDING_Y * 2,
  };
}

function wordmarkBadge(width: number): string {
  const { x: badgeX, y: badgeY, width: badgeWidth, height: badgeHeight } = wordmarkBadgeBox(width);
  const baseline = badgeY + WORDMARK_PADDING_Y + WORDMARK_SIZE * (1 - WORDMARK_BASELINE_DROP) + WORDMARK_PADDING_Y / 2;
  return (
    `<rect x="${badgeX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="${WORDMARK_BADGE_RADIUS}" ` +
    `fill="${EXPORT_PALETTE["--background"]}" fill-opacity="${WORDMARK_BADGE_OPACITY}"/>` +
    `<text x="${badgeX + badgeWidth / 2}" y="${baseline}" text-anchor="middle" ` +
    `font-size="${WORDMARK_SIZE}" fill="${EXPORT_PALETTE["--muted"]}">${WORDMARK}</text>`
  );
}

/** Swaps theme colours for the fixed export palette, for any image made from the drawing. */
export function applyExportPalette(markup: string): string {
  return markup.replace(TAG, applyPaletteToTag);
}

/** Turns on-screen SVG markup into a self-contained image with a background and wordmark. */
export function prepareRideSvg(markup: string, { width, height }: RideImageSize): string {
  const background = `<rect width="${width}" height="${height}" fill="${EXPORT_PALETTE["--background"]}"/>`;
  const wordmark = wordmarkBadge(width);
  return applyExportPalette(markup)
    .replace(
      ROOT_TAG,
      `<svg$1 width="${width}" height="${height}" font-family="${FONT_FAMILY}">${background}`,
    )
    .replace(CLOSING_TAG, `${wordmark}${CLOSING_TAG}`);
}
