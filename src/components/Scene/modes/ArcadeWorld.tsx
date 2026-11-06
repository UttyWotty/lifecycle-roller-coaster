/**
 * Arcade world: a life drawn as an original pixel-art level at night.
 * The ground under the track is stacked from square blocks, so every height steps like an old screen.
 * All shapes are original and are not taken from any existing game.
 */
import type { ReactElement } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { Rider } from "@/lib/scene/riders";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";
import { RiderArt } from "../RiderArt";

const PIXEL = 24;
const BRICK_ID = "arcade-brick";
const CRISP = { shapeRendering: "crispEdges" } as const;

function snap(value: number): number {
  return Math.round(value / PIXEL) * PIXEL;
}

export function ArcadeBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette, scenery } = scene;
  const ground = track.height;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop" {...CRISP}>
      <defs>
        <pattern id={BRICK_ID} width={PIXEL} height={PIXEL} patternUnits="userSpaceOnUse">
          <rect width={PIXEL} height={PIXEL} fill={palette.steel} />
          <rect x={2} y={2} width={PIXEL - 4} height={PIXEL - 4} fill={palette.steelDark} />
          <rect x={2} y={2} width={8} height={4} fill={palette.steel} />
        </pattern>
      </defs>
      <rect width={track.width} height={track.height} fill={palette.skyTop} data-testid="scene-sky" />
      {scenery.stars.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={snap(x)} y={snap(y)} width={4} height={4} fill={palette.pill} />
      ))}
      {scenery.skylineFar.map(({ x, width, height }) => (
        <rect key={x} x={snap(x)} y={snap(ground - height * 0.7)} width={snap(width) + PIXEL} height={snap(height * 0.7)} fill={palette.skylineFar} />
      ))}
      {scenery.clouds.map(({ x, y }) => (
        <g key={x} fill={palette.cloud}>
          <rect x={snap(x)} y={snap(y * 0.6)} width={PIXEL * 4} height={PIXEL} />
          <rect x={snap(x) + PIXEL} y={snap(y * 0.6) - PIXEL} width={PIXEL * 2} height={PIXEL} />
        </g>
      ))}
    </g>
  );
}

export function ArcadeStructure({ track }: { track: Track; palette: ScenePalette }): ReactElement | null {
  const { profile, groundY } = track;
  const first = profile[0];
  const last = profile.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const columns = Array.from({ length: Math.floor((last.x - first.x) / PIXEL) }, (_, index) => first.x + index * PIXEL);
  return (
    <g aria-hidden="true" data-testid="mode-structure" {...CRISP}>
      {columns.map((x) => {
        const top = snap((profile.find((point) => point.x >= x)?.y ?? groundY) + PIXEL / 2);
        return <rect key={x} x={snap(x)} y={top} width={PIXEL} height={Math.max(groundY - top, 0)} fill={`url(#${BRICK_ID})`} />;
      })}
    </g>
  );
}

export function ArcadeRail({ path, palette }: RailProps): ReactElement {
  return <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={6} className="ride-track-draw" data-testid={DRAW_TEST_ID} />;
}

export function PixelCart({ color, rider }: { color: string; rider: Rider }): ReactElement {
  return (
    <g>
      <g transform="translate(0 -38)">
        <RiderArt rider={rider} />
      </g>
      <g {...CRISP}>
        <rect x={-36} y={-30} width={72} height={8} fill={color} />
        <rect x={-36} y={-22} width={72} height={12} fill={color} opacity={0.75} />
        <rect x={-30} y={-10} width={12} height={10} fill="#0f172a" />
        <rect x={18} y={-10} width={12} height={10} fill="#0f172a" />
      </g>
    </g>
  );
}
