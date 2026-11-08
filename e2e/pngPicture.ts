/**
 * Decodes a downloaded PNG inside the browser and samples the picture, for the export tests.
 * It draws the file onto a canvas and reads back a grid of pixels, the top-left corner and one chosen point.
 * Tests use the samples to prove an export shows the real scene, not just that the file is a PNG.
 */
import type { Page } from "@playwright/test";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface PictureSample {
  width: number;
  height: number;
  /** The top-left corner, where every theme's sky gradient starts, or the plain background. */
  skyCorner: Rgb;
  /** Colours in an even grid over the whole picture, rounded so near-identical shades count once. */
  distinctColors: number;
  /** The colour at the requested point, in picture pixels. */
  probe: Rgb;
}

export interface ProbePoint {
  x: number;
  y: number;
}

const GRID_STEP = 24;
const COLOR_ROUNDING = 16;
/** One pixel in from the edge, clear of any anti-aliasing at the border. */
const CORNER_INSET = 1;

export async function samplePicture(page: Page, file: Buffer, probeAt: ProbePoint): Promise<PictureSample> {
  const dataUrl = `data:image/png;base64,${file.toString("base64")}`;
  return page.evaluate(
    async ({ dataUrl, probeAt, step, rounding, corner }) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (context === null) {
        throw new TypeError("Canvas is unavailable");
      }
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const at = (x: number, y: number) => {
        const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
        return { r: data[index], g: data[index + 1], b: data[index + 2] };
      };
      const colors = new Set<string>();
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const { r, g, b } = at(x, y);
          colors.add([r, g, b].map((channel) => Math.round(channel / rounding)).join());
        }
      }
      return {
        width: canvas.width,
        height: canvas.height,
        skyCorner: at(corner, corner),
        distinctColors: colors.size,
        probe: at(probeAt.x, probeAt.y),
      };
    },
    { dataUrl, probeAt, step: GRID_STEP, rounding: COLOR_ROUNDING, corner: CORNER_INSET },
  );
}

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

/** The largest difference in any one channel, so a small blend from anti-aliasing still matches. */
export function colorDistance(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

export function brightness({ r, g, b }: Rgb): number {
  return (r + g + b) / 3;
}
