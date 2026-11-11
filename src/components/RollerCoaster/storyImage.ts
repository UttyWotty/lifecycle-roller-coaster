/**
 * Browser adapter that turns the ride drawing on screen into the portrait story picture as a PNG.
 * The layout comes from the pure storyCard module; this file only serializes the drawing and paints it.
 * Everything happens on the user's device, and the picture leaves it only through a share the user starts.
 */
import { applyExportPalette } from "@/lib/export/rideImage";
import { keepWholeSpans } from "@/lib/export/storySpans";
import { STORY_HEIGHT, STORY_TITLE_FONT, STORY_WIDTH, buildStoryCard, type StoryDrawing, type TextMeasure } from "@/lib/export/storyCard";
import type { LifeEvent } from "@/lib/events/schema";
import type { Locale } from "@/lib/i18n/locales";
import { TITLE_BAND } from "@/lib/track/rideTitle";
import type { Scene } from "@/lib/scene/composeRide";
import type { Track } from "@/lib/track/types";
import { RideExportError, SVG_DATA_PREFIX, drawToPng, loadImage, serializeForExport } from "./downloadRideImage";

export const STORY_FILE_NAME = "my-roller-coaster-story.png";
/** The card is already drawn at full story size, so it is painted pixel for pixel. */
const STORY_SCALE = 1;
const NO_TITLE_BAND = 0;

export interface StoryPicture {
  drawing: StoryDrawing;
  title: string;
  events: readonly LifeEvent[];
}

/** What the story picture needs to know about a drawn track. */
export function storyDrawingOf(track: Track, scene: Scene | null): StoryDrawing {
  return {
    width: track.width,
    height: track.height,
    titleBand: track.title === null ? NO_TITLE_BAND : TITLE_BAND,
    stopXs: track.stops.map(({ x }) => x),
    keepWhole: keepWholeSpans(track, scene),
  };
}

/** Measures title text with a canvas in the font the card draws it in, so wrapping matches the picture. */
function titleMeasure(): TextMeasure {
  const context = document.createElement("canvas").getContext("2d");
  if (context === null) {
    throw new RideExportError();
  }
  context.font = STORY_TITLE_FONT;
  return (text) => context.measureText(text).width;
}

/** Paints the story picture, with its own words in the given language. */
export async function createStoryImage(svg: SVGSVGElement, story: StoryPicture, locale: Locale): Promise<Blob> {
  const markup = buildStoryCard({
    markup: applyExportPalette(serializeForExport(svg)),
    drawing: story.drawing,
    title: story.title,
    events: story.events,
    host: window.location.host,
    measureTitle: titleMeasure(),
    locale,
  });
  const image = await loadImage(`${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`);
  return drawToPng(image, { width: STORY_WIDTH, height: STORY_HEIGHT }, STORY_SCALE);
}
