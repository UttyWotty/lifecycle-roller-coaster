/**
 * The shape of a scene palette: the colours and settings one illustrated theme is drawn with.
 * SceneryKind names the art direction a palette belongs to, which picks its backdrop, structure and rail.
 * This module holds types only, so the palette lists and the theme registry can both depend on it.
 */
/** Which landmarks a scene is built from. */
export type SceneryKind =
  | "city"
  | "fairground"
  | "haunted"
  | "toy"
  | "neon"
  | "line"
  | "poster"
  | "space"
  | "ocean"
  | "mountain"
  | "arcade"
  | "garden"
  | "constellation"
  | "river"
  | "storybook"
  | "comic"
  | "pixel"
  | "dream"
  | "watercolor"
  | "brick"
  | "surreal";

export interface ScenePalette {
  kind: SceneryKind;
  skyTop: string;
  skyBottom: string;
  cloud: string;
  skylineFar: string;
  skylineNear: string;
  steel: string;
  steelDark: string;
  rail: string;
  ground: string;
  title: string;
  ink: string;
  muted: string;
  pill: string;
  cart: string;
  hasStars: boolean;
  /** A sun or moon, or null when the sky has neither. */
  orb: string | null;
  /** Extra canvas below the ground, for a floor or reflection. */
  floor: number;
}
