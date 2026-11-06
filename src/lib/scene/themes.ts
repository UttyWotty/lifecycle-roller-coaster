/**
 * The illustrated themes a ride can be drawn in, with the colours of each one.
 * Colours are fixed values rather than page variables, so a scene looks the same on screen and in exports.
 * This module holds data only, and the Simple theme has no scene at all.
 */

export const RIDE_THEMES = [
  "classic",
  "nightmare",
  "minimal",
  "poster",
  "sunny",
  "sunset",
  "night",
  "retro",
  "haunted",
  "plain",
] as const;
export type RideTheme = (typeof RIDE_THEMES)[number];

export const RIDE_THEME_GROUPS = ["Art modes", "Scenes"] as const;
export type RideThemeGroup = (typeof RIDE_THEME_GROUPS)[number];

export const DEFAULT_RIDE_THEME: RideTheme = "sunny";

/** Which landmarks a scene is built from. */
export type SceneryKind = "city" | "fairground" | "haunted" | "toy" | "neon" | "line" | "poster";

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

interface RideThemeDetails {
  name: string;
  group: RideThemeGroup;
  /** Null means no scene, which draws the simple page-coloured ride. */
  palette: ScenePalette | null;
}

const SUNNY: ScenePalette = {
  kind: "city",
  skyTop: "#8fd3f4",
  skyBottom: "#d6f1ff",
  cloud: "#ffffff",
  skylineFar: "#a4d8f5",
  skylineNear: "#6fb9e8",
  steel: "#d9406b",
  steelDark: "#a32a50",
  rail: "#8f1f43",
  ground: "#7cc66b",
  title: "#16324f",
  ink: "#16324f",
  muted: "#46607a",
  pill: "#ffffff",
  cart: "#2563eb",
  hasStars: false,
  orb: null,
  floor: 0,
};

const SUNSET: ScenePalette = {
  kind: "city",
  skyTop: "#ffb59a",
  skyBottom: "#ffedc7",
  cloud: "#fff5e6",
  skylineFar: "#ffd7ae",
  skylineNear: "#f7bc95",
  steel: "#4c2a6e",
  steelDark: "#351c52",
  rail: "#2a1442",
  ground: "#6d3f6b",
  title: "#3a1d4f",
  ink: "#3a1d4f",
  muted: "#6c4a78",
  pill: "#fff6e9",
  cart: "#f59e0b",
  hasStars: false,
  orb: null,
  floor: 0,
};

const NIGHT: ScenePalette = {
  kind: "city",
  skyTop: "#0b1437",
  skyBottom: "#2b3a78",
  cloud: "#46558f",
  skylineFar: "#26326d",
  skylineNear: "#1a2354",
  steel: "#37d0c5",
  steelDark: "#1c8f8a",
  rail: "#a8fff4",
  ground: "#111838",
  title: "#f8fafc",
  ink: "#10183a",
  muted: "#44507f",
  pill: "#eef2ff",
  cart: "#f472b6",
  hasStars: true,
  orb: null,
  floor: 0,
};

const RETRO: ScenePalette = {
  kind: "fairground",
  skyTop: "#f4e3b5",
  skyBottom: "#fdf6e3",
  cloud: "#fffbf0",
  skylineFar: "#e9d8a6",
  skylineNear: "#e9c46a",
  steel: "#2a9d8f",
  steelDark: "#1f6f67",
  rail: "#9c3d24",
  ground: "#8ab17d",
  title: "#264653",
  ink: "#264653",
  muted: "#55686f",
  pill: "#fff8e7",
  cart: "#e76f51",
  hasStars: false,
  orb: "#f4a261",
  floor: 0,
};

const HAUNTED: ScenePalette = {
  kind: "haunted",
  skyTop: "#33101f",
  skyBottom: "#7a1a2c",
  cloud: "#4a2238",
  skylineFar: "#3a1324",
  skylineNear: "#1a0912",
  steel: "#8b1e2d",
  steelDark: "#4a0f18",
  rail: "#e8dfd0",
  ground: "#0c0508",
  title: "#f3e9dc",
  ink: "#1a0a12",
  muted: "#5a3a42",
  pill: "#f3e9dc",
  cart: "#6b21a8",
  hasStars: false,
  orb: "#f5e6b3",
  floor: 0,
};

const CLASSIC: ScenePalette = {
  kind: "toy",
  skyTop: "#dcecf2",
  skyBottom: "#f3f7f4",
  cloud: "#ffffff",
  skylineFar: "#f4dcbb",
  skylineNear: "#efc9a4",
  steel: "#f3a3b4",
  steelDark: "#d97e93",
  rail: "#e8815f",
  ground: "#fbeee6",
  title: "#7a4453",
  ink: "#5f3442",
  muted: "#8d6573",
  pill: "#fffaf5",
  cart: "#6cc0d8",
  hasStars: false,
  orb: null,
  floor: 40,
};

const NIGHTMARE: ScenePalette = {
  kind: "neon",
  skyTop: "#0a0620",
  skyBottom: "#2a0f5c",
  cloud: "#ffd27a",
  skylineFar: "#1b1140",
  skylineNear: "#120a2e",
  steel: "#a855f7",
  steelDark: "#0b0a1f",
  rail: "#ff2d95",
  ground: "#05030f",
  title: "#f5f3ff",
  ink: "#f5f3ff",
  muted: "#c4b5fd",
  pill: "#15103a",
  cart: "#22d3ee",
  hasStars: false,
  orb: null,
  floor: 150,
};

const MINIMAL: ScenePalette = {
  kind: "line",
  skyTop: "#ffffff",
  skyBottom: "#ffffff",
  cloud: "#ffffff",
  skylineFar: "#ffffff",
  skylineNear: "#ffffff",
  steel: "#111111",
  steelDark: "#111111",
  rail: "#111111",
  ground: "#ffffff",
  title: "#111111",
  ink: "#111111",
  muted: "#555555",
  pill: "#ffffff",
  cart: "#ffffff",
  hasStars: false,
  orb: null,
  floor: 0,
};

const POSTER: ScenePalette = {
  kind: "poster",
  skyTop: "#3c86a8",
  skyBottom: "#f6e9cf",
  cloud: "#d8473b",
  skylineFar: "#f6e9cf",
  skylineNear: "#17324f",
  steel: "#d8473b",
  steelDark: "#17324f",
  rail: "#17324f",
  ground: "#17324f",
  title: "#fbf3df",
  ink: "#17324f",
  muted: "#3f5a72",
  pill: "#fbf3df",
  cart: "#d8473b",
  hasStars: false,
  orb: null,
  floor: 0,
};

export const RIDE_THEME_DETAILS: Readonly<Record<RideTheme, RideThemeDetails>> = {
  classic: { name: "Classic Ride", group: "Art modes", palette: CLASSIC },
  nightmare: { name: "Nightmare Mode", group: "Art modes", palette: NIGHTMARE },
  minimal: { name: "Minimal Mode", group: "Art modes", palette: MINIMAL },
  poster: { name: "Retro Mode", group: "Art modes", palette: POSTER },
  sunny: { name: "Sunny day", group: "Scenes", palette: SUNNY },
  sunset: { name: "Golden sunset", group: "Scenes", palette: SUNSET },
  night: { name: "Starry night", group: "Scenes", palette: NIGHT },
  retro: { name: "Retro fairground", group: "Scenes", palette: RETRO },
  haunted: { name: "Haunted night", group: "Scenes", palette: HAUNTED },
  plain: { name: "Simple", group: "Scenes", palette: null },
};
