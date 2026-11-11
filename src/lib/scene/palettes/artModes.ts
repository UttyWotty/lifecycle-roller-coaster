/**
 * Palettes for the Art modes group: whole art directions such as Classic Ride, Nightmare Mode, Minimal Mode and Retro Mode.
 * Colours are fixed hex values rather than page variables, so a scene looks the same on screen and in exports.
 * The theme registry in themes.ts maps each theme id to one of these palettes.
 */
import type { ScenePalette } from "../palette";

export const CLASSIC: ScenePalette = {
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

export const NIGHTMARE: ScenePalette = {
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

export const MINIMAL: ScenePalette = {
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

export const POSTER: ScenePalette = {
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
