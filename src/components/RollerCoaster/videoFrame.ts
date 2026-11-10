/**
 * Draws one frame of the ride video onto a canvas: captions, the drawing under a following camera, and the address.
 * The intro shows the ride's title over the start, and the ending card fades in over the drawing at the end.
 * Layout and timing come from the pure rideVideo plan; this file only paints what it is given.
 */
import { FONT_FAMILY, STORY_COLORS, STORY_CONTENT_WIDTH, titleLines } from "@/lib/export/storyCard";
import type { CartPose } from "@/lib/ride/ridePlayback";
import {
  DRAWING_BAND_HEIGHT,
  DRAWING_BAND_TOP,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  cameraLeft,
  type DrawingSize,
  type VideoPhase,
} from "@/lib/video/rideVideo";

export interface FrameAssets {
  /** The ride drawing, already rasterised at `scale`. */
  drawing: HTMLImageElement;
  /** The cart, rasterised at `scale` with its origin at CART_BOX's corner, or null for styles without one. */
  cart: HTMLImageElement | null;
  size: DrawingSize;
  scale: number;
  contentOffset: number;
  isMonochrome: boolean;
}

export interface FrameState {
  phase: VideoPhase;
  pose: CartPose;
  caption: { line: string; title: string } | null;
  title: string;
  host: string;
}

/** The area around the cart's origin that its picture covers, in drawing units. */
export const CART_BOX = { x: -80, y: -110, width: 160, height: 130 };
const TITLE_FONT = `700 64px ${FONT_FAMILY}`;
const TITLE_LINE_HEIGHT = 76;
const TITLE_TOP = 120;
const CAPTION_LINE_FONT = `400 36px ${FONT_FAMILY}`;
const CAPTION_LINE_Y = 300;
const CAPTION_TITLE_FONT = `700 44px ${FONT_FAMILY}`;
const CAPTION_TITLE_Y = 362;
const CAPTION_TITLE_LINE_HEIGHT = 50;
const INTRO_TEXT = "Here comes my ride";
const FOOTER_FONT = `700 40px ${FONT_FAMILY}`;
const FOOTER_Y = 1690;
const WORDMARK_FONT = `400 30px ${FONT_FAMILY}`;
const WORDMARK_Y = 1750;
const WORDMARK = "Lifecycle Roller Coaster";
const ENDING_TITLE_FONT = `700 72px ${FONT_FAMILY}`;
const ENDING_TEXT = "That was my ride.";
const ENDING_LINK_FONT = `700 46px ${FONT_FAMILY}`;
const ENDING_GAP = 90;
/**
 * The ending covers the drawing in three equal parts of its time: the card colour fades in until the drawing is hidden,
 * then the text fades in over the clean card, then it holds. So the text never sits over faded stop labels.
 */
const ENDING_PARTS = 3;
const TEXT_DELAY_PARTS = 1;
const MONOCHROME = "grayscale(1)";
const NO_FILTER = "none";
const DEGREES_PER_HALF_TURN = 180;
const HALF = 2;

function centredText(context: CanvasRenderingContext2D, text: string, y: number, font: string, color: string): void {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = "center";
  context.fillText(text, VIDEO_WIDTH / HALF, y);
}

function wrappedText(context: CanvasRenderingContext2D, text: string, top: number, lineHeight: number, font: string, color: string): void {
  context.font = font;
  titleLines(text, (line) => context.measureText(line).width, STORY_CONTENT_WIDTH).forEach((line, index) =>
    centredText(context, line, top + index * lineHeight, font, color),
  );
}

function drawCaptions(context: CanvasRenderingContext2D, state: FrameState): void {
  wrappedText(context, state.title, TITLE_TOP, TITLE_LINE_HEIGHT, TITLE_FONT, STORY_COLORS.title);
  if (state.phase.kind === "intro") {
    centredText(context, INTRO_TEXT, CAPTION_LINE_Y, CAPTION_LINE_FONT, STORY_COLORS.muted);
    return;
  }
  if (state.caption !== null && state.phase.kind === "ride") {
    centredText(context, state.caption.line, CAPTION_LINE_Y, CAPTION_LINE_FONT, STORY_COLORS.muted);
    wrappedText(context, state.caption.title, CAPTION_TITLE_Y, CAPTION_TITLE_LINE_HEIGHT, CAPTION_TITLE_FONT, STORY_COLORS.accent);
  }
}

function drawRide(context: CanvasRenderingContext2D, assets: FrameAssets, pose: CartPose): void {
  const { scale } = assets;
  const drawnHeight = assets.size.height * scale;
  const top = DRAWING_BAND_TOP + (DRAWING_BAND_HEIGHT - drawnHeight) / HALF;
  const left = cameraLeft(pose.x, assets.size, scale);
  context.save();
  context.beginPath();
  context.rect(0, top, VIDEO_WIDTH, drawnHeight);
  context.clip();
  context.drawImage(assets.drawing, -left * scale, top);
  if (assets.cart !== null) {
    context.translate((pose.x - left) * scale, top + (pose.y + assets.contentOffset) * scale);
    context.rotate((pose.angle * Math.PI) / DEGREES_PER_HALF_TURN);
    context.filter = assets.isMonochrome ? MONOCHROME : NO_FILTER;
    context.drawImage(assets.cart, CART_BOX.x * scale, CART_BOX.y * scale, CART_BOX.width * scale, CART_BOX.height * scale);
  }
  context.restore();
}

function drawEnding(context: CanvasRenderingContext2D, state: FrameState, progress: number): void {
  const share = (parts: number): number => Math.min(Math.max(progress * ENDING_PARTS - parts, 0), 1);
  context.save();
  context.globalAlpha = share(0);
  context.fillStyle = STORY_COLORS.card;
  context.fillRect(0, DRAWING_BAND_TOP, VIDEO_WIDTH, DRAWING_BAND_HEIGHT);
  context.globalAlpha = share(TEXT_DELAY_PARTS);
  const middle = DRAWING_BAND_TOP + DRAWING_BAND_HEIGHT / HALF;
  centredText(context, ENDING_TEXT, middle - ENDING_GAP / HALF, ENDING_TITLE_FONT, STORY_COLORS.title);
  centredText(context, `Make yours at ${state.host}`, middle + ENDING_GAP, ENDING_LINK_FONT, STORY_COLORS.accent);
  context.restore();
}

export function drawFrame(context: CanvasRenderingContext2D, assets: FrameAssets, state: FrameState): void {
  context.fillStyle = STORY_COLORS.card;
  context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  drawCaptions(context, state);
  drawRide(context, assets, state.pose);
  if (state.phase.kind === "outro") {
    drawEnding(context, state, state.phase.progress);
  }
  centredText(context, `Make your own ride at ${state.host}`, FOOTER_Y, FOOTER_FONT, STORY_COLORS.accent);
  centredText(context, WORDMARK, WORDMARK_Y, WORDMARK_FONT, STORY_COLORS.muted);
}
