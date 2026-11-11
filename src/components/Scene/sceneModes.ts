/**
 * Registry of what each kind of scene draws: its backdrop, structure, rail and vehicle.
 * Kinds that are not listed share the standard set, so most themes need no code of their own.
 * Adding a new art direction means adding one entry here and one file of drawings.
 */
import type { ComponentType } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette, SceneryKind } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { ArcadeBackdrop, ArcadeRail, ArcadeStructure, PixelCart } from "./modes/ArcadeWorld";
import { ComicBackdrop, ComicRail, ComicStructure } from "./modes/ComicMode";
import { Comet, ConstellationBackdrop, ConstellationRail, ConstellationStructure } from "./modes/ConstellationWorld";
import { GardenBackdrop, GardenRail, GardenStructure, Ladybug } from "./modes/GardenWorld";
import { LineBackdrop, LineRail, LineStructure } from "./modes/LineMode";
import { Hiker, MountainBackdrop, MountainRail, MountainStructure } from "./modes/MountainWorld";
import { NeonBackdrop, NeonRail, NeonStructure } from "./modes/NeonMode";
import { Boat, OceanBackdrop, OceanRail, OceanStructure } from "./modes/OceanWorld";
import { PosterBackdrop, PosterRail, PosterStructure } from "./modes/PosterMode";
import { Canoe, RiverBackdrop, RiverRail, RiverStructure } from "./modes/RiverWorld";
import { Rocket, SpaceBackdrop, SpaceRail, SpaceStructure } from "./modes/SpaceWorld";
import { PaperPlane, StorybookBackdrop, StorybookRail, StorybookStructure } from "./modes/StorybookWorld";
import { ToyBackdrop, ToyRail, ToyStructure } from "./modes/ToyMode";
import { Rail, type RailProps } from "./Rail";
import { StandardCart, type VehicleProps } from "./RideCart";
import { SceneBackdrop } from "./SceneBackdrop";
import { Trestle } from "./Trestle";

interface SceneMode {
  Backdrop: ComponentType<{ scene: Scene; track: Track }>;
  Structure: ComponentType<{ track: Track; palette: ScenePalette }>;
  Rail: ComponentType<RailProps>;
  Vehicle: ComponentType<VehicleProps>;
}

const STANDARD_MODE: SceneMode = { Backdrop: SceneBackdrop, Structure: Trestle, Rail, Vehicle: StandardCart };

const MODES: Readonly<Partial<Record<SceneryKind, SceneMode>>> = {
  toy: { Backdrop: ToyBackdrop, Structure: ToyStructure, Rail: ToyRail, Vehicle: StandardCart },
  neon: { Backdrop: NeonBackdrop, Structure: NeonStructure, Rail: NeonRail, Vehicle: StandardCart },
  line: { Backdrop: LineBackdrop, Structure: LineStructure, Rail: LineRail, Vehicle: StandardCart },
  poster: { Backdrop: PosterBackdrop, Structure: PosterStructure, Rail: PosterRail, Vehicle: StandardCart },
  space: { Backdrop: SpaceBackdrop, Structure: SpaceStructure, Rail: SpaceRail, Vehicle: Rocket },
  ocean: { Backdrop: OceanBackdrop, Structure: OceanStructure, Rail: OceanRail, Vehicle: Boat },
  mountain: { Backdrop: MountainBackdrop, Structure: MountainStructure, Rail: MountainRail, Vehicle: Hiker },
  arcade: { Backdrop: ArcadeBackdrop, Structure: ArcadeStructure, Rail: ArcadeRail, Vehicle: PixelCart },
  garden: { Backdrop: GardenBackdrop, Structure: GardenStructure, Rail: GardenRail, Vehicle: Ladybug },
  constellation: { Backdrop: ConstellationBackdrop, Structure: ConstellationStructure, Rail: ConstellationRail, Vehicle: Comet },
  river: { Backdrop: RiverBackdrop, Structure: RiverStructure, Rail: RiverRail, Vehicle: Canoe },
  comic: { Backdrop: ComicBackdrop, Structure: ComicStructure, Rail: ComicRail, Vehicle: StandardCart },
  storybook: { Backdrop: StorybookBackdrop, Structure: StorybookStructure, Rail: StorybookRail, Vehicle: PaperPlane },
};

export function sceneModeFor(kind: SceneryKind): SceneMode {
  return MODES[kind] ?? STANDARD_MODE;
}
