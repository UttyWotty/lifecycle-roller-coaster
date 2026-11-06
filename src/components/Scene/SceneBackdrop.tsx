/**
 * The sky behind a ride: gradient, stars, clouds, buildings and the theme's landmarks.
 * It fills the whole canvas, including any space kept for the title.
 * It is decoration only and is hidden from screen readers.
 */
import type { ReactElement } from "react";
import type { Cloud } from "@/lib/scene/buildScenery";
import type { Scene } from "@/lib/scene/composeRide";
import type { Track } from "@/lib/track/types";
import { SceneBuildings } from "./SceneBuildings";
import { BatShape, FerrisWheel, SceneOrb } from "./SceneLandmarks";

interface SceneBackdropProps {
  scene: Scene;
  track: Track;
}

const SKY_GRADIENT_ID = "ride-sky";
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

export function SceneBackdrop({ scene, track }: SceneBackdropProps): ReactElement {
  const { palette, scenery } = scene;
  const { width, height } = track;
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
      {scenery.orb && palette.orb && <SceneOrb orb={scenery.orb} color={palette.orb} kind={palette.kind} />}
      <SceneBuildings
        buildings={scenery.skylineFar}
        groundY={height}
        color={palette.skylineFar}
        kind={palette.kind}
        palette={palette}
        opacity={FAR_LAYER_OPACITY}
      />
      {scenery.clouds.map((cloud) => (
        <CloudShape key={cloud.x} cloud={cloud} color={palette.cloud} />
      ))}
      {scenery.bats.map((bat) => (
        <BatShape key={bat.x} bat={bat} />
      ))}
      {scenery.wheels.map((wheel) => (
        <FerrisWheel key={wheel.x} wheel={wheel} groundY={height} palette={palette} />
      ))}
      <SceneBuildings
        buildings={scenery.skylineNear}
        groundY={height}
        color={palette.skylineNear}
        kind={palette.kind}
        palette={palette}
      />
    </g>
  );
}
