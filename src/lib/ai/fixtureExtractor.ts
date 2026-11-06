/**
 * Extractor that returns fixed demo events and never calls an AI provider.
 * It lets developers click through the app as often as they like without spending tokens.
 * It ignores the story and marks its results as demo data, so the app can say so clearly.
 */
import type { ExtractionDraft } from "./extraction";
import type { EventExtractor } from "./extractor";

const FIXTURE_DRAFT: ExtractionDraft = {
  events: [
    {
      date: "2015",
      title: "Started university",
      description: "Started university and felt really excited about it.",
      category: "education",
      sentiment: "positive",
      impact: 7,
      confidence: 0.9,
    },
    {
      date: "2020",
      title: "Lost job during the pandemic",
      description: "Lost a job because of the pandemic.",
      category: "career",
      sentiment: "negative",
      impact: 8,
      confidence: 0.85,
    },
    {
      date: "2022",
      title: "Got married",
      description: "Got married.",
      category: "relationships",
      sentiment: "positive",
      impact: 9,
      confidence: 0.5,
    },
    {
      date: null,
      title: "Ran a first marathon",
      description: "Ran a first marathon at some point.",
      category: "health",
      sentiment: "positive",
      impact: 6,
      confidence: 0.4,
    },
  ],
  clarifications: [],
  chapters: [
    { title: "Finding My Feet", firstEvent: 1, lastEvent: 2 },
    { title: "Starting Again", firstEvent: 3, lastEvent: 4 },
  ],
  report: {
    headline: "Your biggest comeback came right after your hardest moment.",
    highlights: ["You went from losing a job to getting married in two years.", "A marathon suits someone who keeps going."],
  },
};

export function createFixtureExtractor(): EventExtractor {
  return {
    isDemo: true,
    async extract(): Promise<ExtractionDraft> {
      return FIXTURE_DRAFT;
    },
  };
}
