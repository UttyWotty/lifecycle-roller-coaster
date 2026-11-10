/**
 * Pure plan of the ride video: a portrait clip where the camera follows the cart through the ride, stop by stop.
 * It sets the frame layout, how fast the ride plays, the intro and ending card, where the camera looks, and the format.
 * The browser recorder only draws what this plan says, so it needs no layout or timing rules of its own.
 */
import type { TrackStop } from "@/lib/track/types";
import { UNKNOWN_DATE } from "@/lib/track/labelWidth";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
/** The ride plays faster than Ride it, so a whole life fits a short clip. */
export const VIDEO_SPEED = 1.5;
export const INTRO_SECONDS = 1.5;
export const OUTRO_SECONDS = 3;
/** The band the drawing fills, between the captions at the top and the address at the bottom. */
export const DRAWING_BAND_TOP = 430;
export const DRAWING_BAND_HEIGHT = 1080;
/** A short drawing is enlarged at most this much, so it never looks blurry or blown up. */
const MAX_DRAWING_SCALE = 2.2;
/** The camera keeps the cart a little left of centre, so more of the track ahead is in view. */
const CART_VIEW_SHARE = 0.4;
/**
 * Room kept left of the cart, in drawing units, so a cart at the start of the rail is never cut by the frame's edge:
 * the cart's picture reaches 80 units behind its origin, plus a little air.
 */
const CART_LEFT_ROOM = 100;
const DRAWING_LEFT = 0;
const HALF = 2;

/** Recording formats in order of preference: MP4 is what most social apps accept. */
export const VIDEO_TYPES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

export type VideoPhase =
  | { kind: "intro" }
  | { kind: "ride"; elapsed: number }
  | { kind: "outro"; progress: number };

export interface DrawingSize {
  width: number;
  height: number;
}

/** How much the drawing is enlarged to fill the band. */
export function drawingScale({ height }: DrawingSize): number {
  return Math.min(DRAWING_BAND_HEIGHT / height, MAX_DRAWING_SCALE);
}

/**
 * The left edge of the camera, in drawing units: following the cart, held inside the drawing, centred if short.
 * Near the start it may look a little past the drawing's left edge, so the whole cart is in view.
 */
export function cameraLeft(cartX: number, drawing: DrawingSize, scale: number): number {
  const viewWidth = VIDEO_WIDTH / scale;
  if (drawing.width <= viewWidth) {
    return (drawing.width - viewWidth) / HALF;
  }
  const lowest = Math.min(DRAWING_LEFT, cartX - CART_LEFT_ROOM);
  return Math.min(Math.max(cartX - viewWidth * CART_VIEW_SHARE, lowest), drawing.width - viewWidth);
}

/** The whole clip's length for a ride timeline of this many seconds. */
export function videoSeconds(rideSeconds: number): number {
  return INTRO_SECONDS + rideSeconds / VIDEO_SPEED + OUTRO_SECONDS;
}

/** What the clip shows at a moment: the intro, the ride at a point of its timeline, or the ending card. */
export function phaseAt(seconds: number, rideSeconds: number): VideoPhase {
  if (seconds < INTRO_SECONDS) {
    return { kind: "intro" };
  }
  const elapsed = (seconds - INTRO_SECONDS) * VIDEO_SPEED;
  if (elapsed < rideSeconds) {
    return { kind: "ride", elapsed };
  }
  const outro = seconds - INTRO_SECONDS - rideSeconds / VIDEO_SPEED;
  return { kind: "outro", progress: Math.min(Math.max(outro / OUTRO_SECONDS, 0), 1) };
}

/** The first recording format the browser supports, or null when it cannot record video. */
export function chooseVideoType(isSupported: (type: string) => boolean): string | null {
  return VIDEO_TYPES.find((type) => isSupported(type)) ?? null;
}

/** The file name for a recording of this format. */
export function videoFileName(type: string): string {
  return type.startsWith("video/mp4") ? "my-roller-coaster-ride.mp4" : "my-roller-coaster-ride.webm";
}

/** The format without its codecs, for the saved file. */
export function baseVideoType(type: string): string {
  return type.split(";")[0];
}

/** The caption for a stop: its number, its date and its title. */
export function stopCaption(stop: TrackStop, index: number, count: number): { line: string; title: string } {
  return { line: `Stop ${index + 1} of ${count} · ${stop.date ?? UNKNOWN_DATE}`, title: stop.title };
}
