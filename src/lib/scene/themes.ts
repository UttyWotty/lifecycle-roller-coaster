/**
 * The illustrated themes a ride can be drawn in, with the colours of each one.
 * Colours are fixed values rather than page variables, so a scene looks the same on screen and in exports.
 * This module holds data only, and the Simple theme has no scene at all.
 */

export const RIDE_THEMES = ["sunny", "sunset", "night", "plain"] as const;
export type RideTheme = (typeof RIDE_THEMES)[number];

export const DEFAULT_RIDE_THEME: RideTheme = "sunny";

export interface ScenePalette {
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
}

interface RideThemeDetails {
  name: string;
  /** Colours for the small preview in the picker. */
  swatch: readonly [string, string];
  /** Null means no scene, which draws the simple page-coloured ride. */
  palette: ScenePalette | null;
}

const SUNNY: ScenePalette = {
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
};

const SUNSET: ScenePalette = {
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
};

const NIGHT: ScenePalette = {
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
};

export const RIDE_THEME_DETAILS: Readonly<Record<RideTheme, RideThemeDetails>> = {
  sunny: { name: "Sunny day", swatch: [SUNNY.skyTop, SUNNY.steel], palette: SUNNY },
  sunset: { name: "Golden sunset", swatch: [SUNSET.skyBottom, SUNSET.skyTop], palette: SUNSET },
  night: { name: "Starry night", swatch: [NIGHT.skyTop, NIGHT.steel], palette: NIGHT },
  plain: { name: "Simple", swatch: ["#ffffff", "#e11d48"], palette: null },
};
