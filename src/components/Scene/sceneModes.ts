/**
 * Registry of what each kind of scene draws: its backdrop, its structure and its rail.
 * Kinds that are not listed share the standard set, so most themes need no code of their own.
 * Adding a new art direction means adding one entry here and one file of drawings.
 */
import type { ComponentType } from "react";
import type { Scene } from "@/lib/scene/composeRide";
import type { ScenePalette, SceneryKind } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { LineBackdrop, LineRail, LineStructure } from "./modes/LineMode";
import { NeonBackdrop, NeonRail, NeonStructure } from "./modes/NeonMode";
import { PosterBackdrop, PosterRail, PosterStructure } from "./modes/PosterMode";
import { ToyBackdrop, ToyRail, ToyStructure } from "./modes/ToyMode";
import { Rail, type RailProps } from "./Rail";
import { SceneBackdrop } from "./SceneBackdrop";
import { Trestle } from "./Trestle";

interface SceneMode {
  Backdrop: ComponentType<{ scene: Scene; track: Track }>;
  Structure: ComponentType<{ track: Track; palette: ScenePalette }>;
  Rail: ComponentType<RailProps>;
}

const STANDARD_MODE: SceneMode = { Backdrop: SceneBackdrop, Structure: Trestle, Rail };

const MODES: Readonly<Partial<Record<SceneryKind, SceneMode>>> = {
  toy: { Backdrop: ToyBackdrop, Structure: ToyStructure, Rail: ToyRail },
  neon: { Backdrop: NeonBackdrop, Structure: NeonStructure, Rail: NeonRail },
  line: { Backdrop: LineBackdrop, Structure: LineStructure, Rail: LineRail },
  poster: { Backdrop: PosterBackdrop, Structure: PosterStructure, Rail: PosterRail },
};

export function sceneModeFor(kind: SceneryKind): SceneMode {
  return MODES[kind] ?? STANDARD_MODE;
}
