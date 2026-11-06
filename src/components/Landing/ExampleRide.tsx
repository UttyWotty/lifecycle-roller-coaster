/**
 * Example ride for the landing page, drawn by the real track generator.
 * It uses a fictional life story to show what a finished ride looks like.
 * The landing page therefore always matches what the app actually produces.
 */
import type { ReactElement } from "react";
import { RideTrack } from "@/components/RollerCoaster/RideTrack";
import type { LifeEvent } from "@/lib/events/schema";
import { composeRide } from "@/lib/scene/composeRide";

const DESCRIPTION =
  "An example roller-coaster track in a sunny city that rises at happy life events and drops at hard ones.";

const EXAMPLE_EVENTS: readonly LifeEvent[] = [
  {
    id: "example_1",
    date: "2015",
    title: "Started university",
    description: "",
    category: "education",
    sentiment: "positive",
    impact: 7,
    confidence: 1,
  },
  {
    id: "example_2",
    date: "2020",
    title: "Lost a job",
    description: "",
    category: "career",
    sentiment: "negative",
    impact: 9,
    confidence: 1,
  },
  {
    id: "example_3",
    date: "2022",
    title: "Got married",
    description: "",
    category: "relationships",
    sentiment: "positive",
    impact: 9,
    confidence: 1,
  },
  {
    id: "example_4",
    date: "2026",
    title: "Built a company",
    description: "",
    category: "business",
    sentiment: "positive",
    impact: 8,
    confidence: 1,
  },
];

export function ExampleRide(): ReactElement {
  const { track, scene } = composeRide(EXAMPLE_EVENTS, { style: "loops", theme: "sunny", title: "" });
  return <RideTrack track={track} scene={scene} label={DESCRIPTION} />;
}
