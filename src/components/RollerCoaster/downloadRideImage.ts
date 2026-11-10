/**
 * Browser adapter that turns the ride drawing into a PNG to download, and shares any picture the user chooses to.
 * All work happens on the user's device, and an image leaves it only through a share the user starts.
 * Failures surface as a single domain error that the interface can explain.
 */
import {
  EXPORT_HIDDEN_ATTRIBUTE,
  exportScale,
  prepareRideSvg,
  type RideImageSize,
} from "@/lib/export/rideImage";

const FILE_NAME = "my-roller-coaster.png";
export const IMAGE_TYPE = "image/png";
const ABORT_ERROR = "AbortError";
export const SVG_DATA_PREFIX = "data:image/svg+xml;charset=utf-8,";

export type ShareOutcome = "shared" | "cancelled" | "copied" | "downloaded";

export class RideExportError extends Error {
  constructor() {
    super("The ride image could not be created");
    this.name = "RideExportError";
  }
}

export function serializeForExport(svg: SVGSVGElement): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.removeAttribute("style");
  copy.querySelectorAll(`[${EXPORT_HIDDEN_ATTRIBUTE}]`).forEach((element) => element.remove());
  return new XMLSerializer().serializeToString(copy);
}

export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new RideExportError());
    image.src = source;
  });
}

/** Paints a loaded picture onto a canvas at a scale and returns it as PNG. */
export function drawToPng(image: HTMLImageElement, size: RideImageSize, scale: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(size.width * scale);
  canvas.height = Math.floor(size.height * scale);
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new RideExportError();
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob === null ? reject(new RideExportError()) : resolve(blob)),
      IMAGE_TYPE,
    );
  });
}

export function saveFile(blob: Blob, fileName: string = FILE_NAME): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function createRideImage(svg: SVGSVGElement, size: RideImageSize): Promise<Blob> {
  const markup = prepareRideSvg(serializeForExport(svg), size);
  const image = await loadImage(`${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`);
  return drawToPng(image, size, exportScale(size));
}

export async function downloadRideImage(svg: SVGSVGElement, size: RideImageSize): Promise<void> {
  saveFile(await createRideImage(svg, size));
}

export async function copyToClipboard(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || navigator.clipboard?.write === undefined) {
    return false;
  }
  await navigator.clipboard.write([new ClipboardItem({ [IMAGE_TYPE]: blob })]);
  return true;
}

export interface ShareText {
  title: string;
  /** The message posted with the picture, which can carry a link. */
  text: string;
}

/** Shares a picture through the device's share sheet, then the clipboard, and downloads it as a last resort. */
export async function shareImageFile(blob: Blob, fileName: string, message: ShareText): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: IMAGE_TYPE });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: message.title, text: message.text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === ABORT_ERROR) {
        return "cancelled";
      }
    }
  }
  try {
    if (await copyToClipboard(blob)) {
      return "copied";
    }
  } catch {
    saveFile(blob, fileName);
    return "downloaded";
  }
  saveFile(blob, fileName);
  return "downloaded";
}
