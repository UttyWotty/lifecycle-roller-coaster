/**
 * Browser adapter that turns the ride drawing on screen into the printable A3 poster as a PNG.
 * The layout comes from the pure poster module; this file only measures the title, serializes the drawing and paints it.
 * Everything happens on the user's device, and the file is saved there.
 */
import { applyExportPalette } from "@/lib/export/rideImage";
import { POSTER_HEIGHT, POSTER_TITLE_FONT, POSTER_WIDTH, buildPoster, posterScale } from "@/lib/export/poster";
import type { TextMeasure } from "@/lib/export/storyCard";
import { RideExportError, SVG_DATA_PREFIX, drawToPng, loadImage, serializeForExport } from "./downloadRideImage";
import type { StoryPicture } from "./storyImage";

/** Measures title text with a canvas in the font the poster draws it in, so wrapping matches the print. */
function titleMeasure(): TextMeasure {
  const context = document.createElement("canvas").getContext("2d");
  if (context === null) {
    throw new RideExportError();
  }
  context.font = POSTER_TITLE_FONT;
  return (text) => context.measureText(text).width;
}

export async function createPosterImage(svg: SVGSVGElement, picture: StoryPicture): Promise<Blob> {
  const markup = buildPoster({
    markup: applyExportPalette(serializeForExport(svg)),
    drawing: picture.drawing,
    title: picture.title,
    events: picture.events,
    measureTitle: titleMeasure(),
  });
  const image = await loadImage(`${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`);
  return drawToPng(image, { width: POSTER_WIDTH, height: POSTER_HEIGHT }, posterScale());
}
