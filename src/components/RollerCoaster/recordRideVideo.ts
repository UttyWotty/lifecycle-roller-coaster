/**
 * Browser recorder for the ride video: it paints each frame to a canvas and records it with the ride sounds.
 * The drawing and cart come from the ride on screen in the export palette, and the timing reuses Ride it's timeline;
 * the theme music plays under it when the user has Music on.
 * Everything stays on the device until the user shares the file, and a cancel stops the recording at once.
 */
import { EXPORT_HIDDEN_ATTRIBUTE, applyExportPalette } from "@/lib/export/rideImage";
import { buildTimeline, poseAt, positionAt, type RailSample, type Timeline } from "@/lib/ride/ridePlayback";
import { FINISH_CUE, cueForStep, stepIndexAt, stepsToSound, type SoundCue } from "@/lib/ride/rideSounds";
import type { Locale } from "@/lib/i18n/locales";
import type { Tune } from "@/lib/music/themeTunes";
import { pastStops } from "@/lib/track/futureStops";
import type { Track } from "@/lib/track/types";
import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_SPEED,
  VIDEO_WIDTH,
  baseVideoType,
  chooseVideoType,
  drawingScale,
  phaseAt,
  stopCaption,
  videoFileName,
  videoSeconds,
} from "@/lib/video/rideVideo";
import { SVG_DATA_PREFIX, loadImage } from "./downloadRideImage";
import { railPathOf, railSamples } from "./measureRail";
import { createMusicPlayer } from "./musicPlayer";
import { createRideSoundPlayer, type RideSoundPlayer } from "./rideSoundPlayer";
import { CART_BOX, drawFrame, type FrameAssets } from "./videoFrame";

export class RideVideoError extends Error {
  constructor(public readonly reason: "unsupported" | "cancelled" | "failed") {
    super(`The ride video could not be made: ${reason}`);
    this.name = "RideVideoError";
  }
}

export interface RideVideoInput {
  svg: SVGSVGElement;
  track: Track;
  title: string;
  /** Full event titles by id; the drawing's stops carry shortened labels. */
  titles: ReadonlyMap<string, string>;
  isMonochrome: boolean;
  /** Rolls through every stop without pausing, as Ride it does with Non-stop on. */
  isNonStop: boolean;
  /** The theme's tune to play under the video, or null without music. */
  music: Tune | null;
  /** The language of the video's captions and cards. */
  locale: Locale;
  onProgress: (share: number) => void;
  signal: AbortSignal;
}

export interface RideVideo {
  blob: Blob;
  type: string;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const PARKED_CART = '[data-testid="ride-cart-parked"]';
const BACKGROUND = "#ffffff";
const FONT = "Arial, Helvetica, sans-serif";
const BITS_PER_SECOND = 8_000_000;
const CHUNK_MS = 1000;
const MS_PER_SECOND = 1000;
const NO_STEP = -1;
const ABORT_ERROR = "AbortError";

/** Whether this browser can record a ride video at all. */
export function canRecordVideo(): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function" &&
    chooseVideoType((type) => MediaRecorder.isTypeSupported(type)) !== null
  );
}

function drawingMarkup(svg: SVGSVGElement, track: Track, scale: number): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.removeAttribute("style");
  copy.querySelectorAll(`[${EXPORT_HIDDEN_ATTRIBUTE}], ${PARKED_CART}`).forEach((element) => element.remove());
  copy.setAttribute("width", String(track.width * scale));
  copy.setAttribute("height", String(track.height * scale));
  copy.setAttribute("font-family", FONT);
  const background = document.createElementNS(SVG_NAMESPACE, "rect");
  background.setAttribute("width", String(track.width));
  background.setAttribute("height", String(track.height));
  background.setAttribute("fill", BACKGROUND);
  copy.prepend(background);
  return applyExportPalette(new XMLSerializer().serializeToString(copy));
}

function cartMarkup(svg: SVGSVGElement, scale: number): string | null {
  const parked = svg.querySelector(PARKED_CART);
  if (parked === null) {
    return null;
  }
  const inner = Array.from(parked.children, (child) => new XMLSerializer().serializeToString(child)).join("");
  const { x, y, width, height } = CART_BOX;
  return applyExportPalette(
    `<svg xmlns="${SVG_NAMESPACE}" viewBox="${x} ${y} ${width} ${height}" width="${width * scale}" height="${height * scale}">${inner}</svg>`,
  );
}

async function loadAssets(input: RideVideoInput): Promise<FrameAssets> {
  const scale = drawingScale(input.track);
  const toImage = (markup: string): Promise<HTMLImageElement> => loadImage(`${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`);
  const cart = cartMarkup(input.svg, scale);
  return {
    drawing: await toImage(drawingMarkup(input.svg, input.track, scale)),
    cart: cart === null ? null : await toImage(cart),
    size: { width: input.track.width, height: input.track.height },
    scale,
    contentOffset: input.track.contentOffset,
    isMonochrome: input.isMonochrome,
  };
}

/** Plays each step's sound once, including stops passed between frames, sped up like the video, and the finish when the ending begins. */
function soundCues(track: Track, samples: readonly RailSample[], timeline: Timeline, player: RideSoundPlayer) {
  let sounded = NO_STEP;
  const scaled = (cue: SoundCue): SoundCue =>
    cue.kind === "climb" || cue.kind === "drop" ? { ...cue, seconds: cue.seconds / VIDEO_SPEED } : cue;
  return (elapsed: number | null): void => {
    const step = elapsed === null ? timeline.steps.length : stepIndexAt(timeline.steps, elapsed);
    stepsToSound(timeline.steps, sounded, step).forEach((index) => {
      const cue = index >= timeline.steps.length
        ? FINISH_CUE
        : cueForStep(timeline.steps[index], { samples, stops: track.stops, trackHeight: track.height });
      if (cue !== null) {
        player.play(scaled(cue));
      }
    });
    sounded = step;
  };
}

function recordFrames(
  input: RideVideoInput,
  assets: FrameAssets,
  canvas: HTMLCanvasElement,
  audio: { context: AudioContext; player: RideSoundPlayer },
): Promise<void> {
  const context = canvas.getContext("2d");
  if (context === null) {
    return Promise.reject(new RideVideoError("failed"));
  }
  const stops = pastStops(input.track);
  const samples = railSamples(input.track.future?.pastRail ?? railPathOf(input.track), stops);
  const timeline = buildTimeline(samples, stops, { trackHeight: input.track.height, isInstant: false, isNonStop: input.isNonStop });
  const total = videoSeconds(timeline.duration);
  const sound = soundCues(input.track, samples, timeline, audio.player);
  const startedAt = performance.now();
  const host = window.location.host;
  return new Promise((resolve, reject) => {
    const frame = (): void => {
      if (input.signal.aborted) {
        reject(new RideVideoError("cancelled"));
        return;
      }
      const seconds = (performance.now() - startedAt) / MS_PER_SECOND;
      const phase = phaseAt(seconds, timeline.duration);
      const elapsed = phase.kind === "ride" ? phase.elapsed : phase.kind === "intro" ? 0 : timeline.duration;
      const position = positionAt(timeline, elapsed);
      if (phase.kind !== "intro") {
        sound(phase.kind === "ride" ? elapsed : null);
      }
      const stop = position.stopIndex === null ? null : stops[position.stopIndex];
      const caption =
        stop === null || position.stopIndex === null
          ? null
          : stopCaption({ ...stop, title: input.titles.get(stop.id) ?? stop.title }, position.stopIndex, stops.length, input.locale);
      drawFrame(context, assets, { phase, pose: poseAt(samples, position.length), caption, title: input.title, host, locale: input.locale });
      input.onProgress(Math.min(seconds / total, 1));
      if (seconds >= total) {
        resolve();
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/** Records the ride as a video. Call it from a click, so the browser lets its sound start. */
export async function recordRideVideo(input: RideVideoInput): Promise<RideVideo> {
  const type = chooseVideoType((candidate) => MediaRecorder.isTypeSupported(candidate));
  if (type === null) {
    throw new RideVideoError("unsupported");
  }
  const audioContext = new AudioContext();
  /** Some phones start a new audio context asleep; this call comes from the click, so it is allowed to wake it. */
  void audioContext.resume();
  const destination = audioContext.createMediaStreamDestination();
  const audio = { context: audioContext, player: createRideSoundPlayer(audioContext, destination) };
  const musicPlayer = createMusicPlayer(audioContext, destination);
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const stream = new MediaStream([...canvas.captureStream(VIDEO_FPS).getVideoTracks(), ...destination.stream.getAudioTracks()]);
  const chunks: Blob[] = [];
  try {
    const assets = await loadAssets(input);
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: BITS_PER_SECOND });
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
    recorder.start(CHUNK_MS);
    if (input.music !== null) {
      musicPlayer.play(input.music);
    }
    try {
      await recordFrames(input, assets, canvas, audio);
    } finally {
      recorder.stop();
      await stopped;
    }
    return { blob: new Blob(chunks, { type: baseVideoType(type) }), type };
  } catch (error) {
    throw error instanceof RideVideoError ? error : new RideVideoError("failed");
  } finally {
    audio.player.stop();
    musicPlayer.stop();
    stream.getTracks().forEach((track) => track.stop());
    void audioContext.close();
  }
}

export type VideoOutcome = "shared" | "cancelled" | "downloaded";

/** Hands the video to the device's share sheet, or downloads it where sharing files is not possible. */
export async function shareRideVideo(video: RideVideo, title: string): Promise<VideoOutcome> {
  const file = new File([video.blob], videoFileName(video.type), { type: baseVideoType(video.type) });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === ABORT_ERROR) {
        return "cancelled";
      }
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
