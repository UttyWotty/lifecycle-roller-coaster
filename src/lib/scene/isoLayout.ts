/**
 * Pure geometry for the Isometric model look, which fakes depth by pushing shapes back along one fixed direction.
 * It gives the rail's extrusion offsets, the three visible faces of a box pillar and the grid on the tiled base slab.
 * Every point is computed from the inputs and fixed constants, so the model looks the same on every redraw.
 */
import type { TrackPoint } from "@/lib/track/types";

/** One step back into the picture: up and to the right. */
export const DEPTH: TrackPoint = { x: 16, y: -11 };
/** The rail is drawn this many times along the depth, to look solid. */
export const RAIL_LAYERS = 8;
/** The base slab reaches this many depth steps back from the front edge. */
export const SLAB_DEPTH_STEPS = 5;
/** Grid lines on the slab run this far apart along its front edge. */
export const TILE_WIDTH = 48;

export interface BoxFaces {
  front: string;
  side: string;
  top: string;
}

export interface Segment {
  from: TrackPoint;
  to: TrackPoint;
}

function points(list: readonly TrackPoint[]): string {
  return list.map(({ x, y }) => `${x},${y}`).join(" ");
}

/** Offsets from the front of the rail to its back, evenly spaced, nearest last so it is painted on top. */
export function railOffsets(): TrackPoint[] {
  return Array.from({ length: RAIL_LAYERS }, (_, index) => {
    const share = (RAIL_LAYERS - 1 - index) / (RAIL_LAYERS - 1);
    /** Adding zero turns -0 into 0, so the front layer is exactly at the origin. */
    return { x: DEPTH.x * share + 0, y: DEPTH.y * share + 0 };
  });
}

/** The front, right side and top faces of a box standing on the ground, centred on x. */
export function boxFaces(x: number, top: number, bottom: number, halfWidth: number): BoxFaces {
  const left = x - halfWidth;
  const right = x + halfWidth;
  const back = (point: TrackPoint): TrackPoint => ({ x: point.x + DEPTH.x, y: point.y + DEPTH.y });
  const frontTopRight = { x: right, y: top };
  const frontBottomRight = { x: right, y: bottom };
  const frontTopLeft = { x: left, y: top };
  return {
    front: points([frontTopLeft, frontTopRight, frontBottomRight, { x: left, y: bottom }]),
    side: points([frontTopRight, back(frontTopRight), back(frontBottomRight), frontBottomRight]),
    top: points([frontTopLeft, back(frontTopLeft), back(frontTopRight), frontTopRight]),
  };
}

/** The slab's top face as a polygon, from the front edge at ground level back by its depth. */
export function slabTop(width: number, ground: number): string {
  const backX = DEPTH.x * SLAB_DEPTH_STEPS;
  const backY = ground + DEPTH.y * SLAB_DEPTH_STEPS;
  return points([{ x: 0, y: ground }, { x: backX, y: backY }, { x: width + backX, y: backY }, { x: width, y: ground }]);
}

/** Grid lines on the slab: one back into the picture at every tile, and one across at every depth step. */
export function slabGrid(width: number, ground: number): Segment[] {
  const backX = DEPTH.x * SLAB_DEPTH_STEPS;
  const backY = DEPTH.y * SLAB_DEPTH_STEPS;
  const count = Math.floor(width / TILE_WIDTH);
  const into = Array.from({ length: count + 1 }, (_, index) => {
    const x = index * TILE_WIDTH;
    return { from: { x, y: ground }, to: { x: x + backX, y: ground + backY } };
  });
  const across = Array.from({ length: SLAB_DEPTH_STEPS - 1 }, (_, index) => {
    const step = index + 1;
    const dx = DEPTH.x * step;
    const y = ground + DEPTH.y * step;
    return { from: { x: dx, y }, to: { x: width + dx, y } };
  });
  return [...into, ...across];
}
