/**
 * The characters a person can choose to ride their cart.
 * All of them are original and drawn in code, with no outside artwork.
 * This module holds data only, and the drawings live with the components.
 */

export const RIDERS = ["smiley", "cat", "robot", "astronaut", "dino", "ghost"] as const;
export type Rider = (typeof RIDERS)[number];

export const DEFAULT_RIDER: Rider = "smiley";

export const RIDER_NAMES: Readonly<Record<Rider, string>> = {
  smiley: "Smiley",
  cat: "Cat",
  robot: "Robot",
  astronaut: "Astronaut",
  dino: "Dino",
  ghost: "Ghost",
};
