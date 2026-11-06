/**
 * The sky behind a ride: gradient, stars, clouds and a two-layer city skyline.
 * It fills the whole canvas, including any space kept for the title.
 * It is decoration only and is hidden from screen readers.
 */
import type { ReactElement } from "react";
import type { Building, Cloud } from "@/lib/scene/buildScenery";
import type { Scene } from "@/lib/scene/composeRide";

interface SceneBackdropProps {
  scene: Scene;
  width: number;
  height: number;
}

const SKY_GRADIENT_ID = "ride-sky";
const SPIRE_WIDTH = 5;
const SPIRE_HEIGHT = 34;
const FAR_LAYER_OPACITY = 0.8;

/** Overlapping circles on a flat base make the shape of a cartoon cloud. */
function CloudShape({ cloud, color }: { cloud: Cloud; color: string }): ReactElement {
  return (
    <g transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`} fill={color}>
      <circle cx={-38} cy={-8} r={20} />
      <circle cx={-6} cy={-22} r={28} />
      <circle cx={30} cy={-12} r={22} />
      <rect x={-62} y={-10} width={118} height={22} rx={11} />
    </g>
  );
}

function Skyline(props: {
  buildings: readonly Building[];
  groundY: number;
  color: string;
  opacity?: number;
}): ReactElement {
  const { buildings, groundY, color, opacity = 1 } = props;
  return (
    <g fill={color} opacity={opacity}>
      {buildings.map(({ x, width, height, hasSpire }) => (
        <g key={x}>
          <rect x={x} y={groundY - height} width={width} height={height} />
          {hasSpire && (
            <rect
              x={x + width / 2 - SPIRE_WIDTH / 2}
              y={groundY - height - SPIRE_HEIGHT}
              width={SPIRE_WIDTH}
              height={SPIRE_HEIGHT}
            />
          )}
        </g>
      ))}
    </g>
  );
}

export function SceneBackdrop({ scene, width, height }: SceneBackdropProps): ReactElement {
  const { palette, scenery } = scene;
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={SKY_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${SKY_GRADIENT_ID})`} data-testid="scene-sky" />
      {scenery.stars.map(({ x, y, radius }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={radius} fill={palette.pill} />
      ))}
      <Skyline buildings={scenery.skylineFar} groundY={height} color={palette.skylineFar} opacity={FAR_LAYER_OPACITY} />
      {scenery.clouds.map((cloud) => (
        <CloudShape key={cloud.x} cloud={cloud} color={palette.cloud} />
      ))}
      <Skyline buildings={scenery.skylineNear} groundY={height} color={palette.skylineNear} />
    </g>
  );
}
