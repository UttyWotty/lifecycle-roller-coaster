/**
 * The row of buildings along the bottom of a scene, shaped to suit the theme.
 * Cities get towers with spires, fairgrounds get striped tents, and haunted scenes get pointed towers.
 * Every shape comes from the same generated list, so each kind of scene fits the canvas the same way.
 */
import type { ReactElement } from "react";
import type { Building } from "@/lib/scene/buildScenery";
import type { ScenePalette, SceneryKind } from "@/lib/scene/themes";

interface SceneBuildingsProps {
  buildings: readonly Building[];
  groundY: number;
  color: string;
  kind: SceneryKind;
  palette: ScenePalette;
  opacity?: number;
}

interface ShapeProps {
  building: Building;
  groundY: number;
  color: string;
  palette: ScenePalette;
}

const SPIRE_WIDTH = 5;
const SPIRE_HEIGHT = 34;
const TENT_HEIGHT_TO_WIDTH = 1.5;
const TENT_ROOF_SHARE = 0.45;
const TENT_STRIPES = 4;
const TENT_FLAG_POLE = 16;
const TENT_FLAG_WIDTH = 12;
const TENT_FLAG_HEIGHT = 7;
const TOWER_ROOF_SHARE = 0.7;
const TOWER_ROOF_OVERHANG = 5;
const WINDOW_SIZE = 8;
const WINDOW_DROP = 26;
const WINDOW_COLOR = "#facc15";

function CityBlock({ building, groundY, color }: ShapeProps): ReactElement {
  const { x, width, height, hasSpire } = building;
  return (
    <g fill={color}>
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
  );
}

function Tent({ building, groundY, palette }: ShapeProps): ReactElement {
  const { x, width } = building;
  const height = Math.min(building.height, width * TENT_HEIGHT_TO_WIDTH);
  const roofHeight = height * TENT_ROOF_SHARE;
  const wallTop = groundY - height + roofHeight;
  const stripeWidth = width / TENT_STRIPES;
  const peakX = x + width / 2;
  const peakY = groundY - height;
  const stripes = Array.from({ length: TENT_STRIPES }, (_, index) => index);
  return (
    <g data-testid="scene-tent">
      {stripes.map((index) => (
        <rect
          key={index}
          x={x + index * stripeWidth}
          y={wallTop}
          width={stripeWidth}
          height={groundY - wallTop}
          fill={index % 2 === 0 ? palette.cart : palette.pill}
        />
      ))}
      <path d={`M${x} ${wallTop} L${peakX} ${peakY} L${x + width} ${wallTop} Z`} fill={palette.rail} />
      <line x1={peakX} y1={peakY} x2={peakX} y2={peakY - TENT_FLAG_POLE} stroke={palette.rail} strokeWidth={2} />
      <path
        d={`M${peakX} ${peakY - TENT_FLAG_POLE} l${TENT_FLAG_WIDTH} ${TENT_FLAG_HEIGHT / 2} l-${TENT_FLAG_WIDTH} ${TENT_FLAG_HEIGHT / 2} Z`}
        fill={palette.steel}
      />
    </g>
  );
}

function HauntedTower({ building, groundY, color }: ShapeProps): ReactElement {
  const { x, width, height, hasSpire } = building;
  const top = groundY - height;
  const roofHeight = width * TOWER_ROOF_SHARE;
  const peakX = x + width / 2;
  return (
    <g fill={color} data-testid="scene-tower">
      <rect x={x} y={top} width={width} height={height} />
      <path
        d={`M${x - TOWER_ROOF_OVERHANG} ${top} L${peakX} ${top - roofHeight} L${x + width + TOWER_ROOF_OVERHANG} ${top} Z`}
      />
      {hasSpire && (
        <rect
          x={peakX - WINDOW_SIZE / 2}
          y={top + WINDOW_DROP}
          width={WINDOW_SIZE}
          height={WINDOW_SIZE * 1.5}
          fill={WINDOW_COLOR}
        />
      )}
    </g>
  );
}

const SHAPES: Readonly<Partial<Record<SceneryKind, (props: ShapeProps) => ReactElement>>> = {
  fairground: Tent,
  haunted: HauntedTower,
};

export function SceneBuildings(props: SceneBuildingsProps): ReactElement {
  const { buildings, groundY, color, kind, palette, opacity = 1 } = props;
  const Shape = SHAPES[kind] ?? CityBlock;
  return (
    <g opacity={opacity}>
      {buildings.map((building) => (
        <Shape key={building.x} building={building} groundY={groundY} color={color} palette={palette} />
      ))}
    </g>
  );
}
