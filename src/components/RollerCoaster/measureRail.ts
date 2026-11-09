/**
 * Browser measuring of a ride's rail, shared by Ride it and Ride together.
 * It samples the rail path at small even steps with a detached SVG path, which the browser measures without drawing.
 * Tracks without a rail, such as the metro map, fall back to straight lines between their points.
 */
import { polylineSamples, type RailSample } from "@/lib/ride/ridePlayback";
import type { Track, TrackPoint } from "@/lib/track/types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
/** Distance between rail samples, small enough that the cart follows curves smoothly. */
const SAMPLE_SPACING = 4;
const NO_CATEGORY = null;

/** The path the cart rides: the line with no category, or null for styles without one. */
export function railPathOf(track: Track): string | null {
  return track.lines.find(({ category }) => category === NO_CATEGORY)?.path ?? null;
}

/** Samples a rail path; the browser must be able to lay out SVG. */
export function measureRail(path: string): RailSample[] {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  const element = document.createElementNS(SVG_NAMESPACE, "path");
  element.setAttribute("d", path);
  svg.append(element);
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  document.body.append(svg);
  try {
    const total = element.getTotalLength();
    const count = Math.max(Math.ceil(total / SAMPLE_SPACING), 1);
    return Array.from({ length: count + 1 }, (_, index) => {
      const length = (total * index) / count;
      const { x, y } = element.getPointAtLength(length);
      return { x, y, length };
    });
  } finally {
    svg.remove();
  }
}

/** Samples of the rail, or of straight lines through the given points when the path is missing. */
export function railSamples(path: string | null, fallback: readonly TrackPoint[]): RailSample[] {
  return path ? measureRail(path) : polylineSamples(fallback);
}
