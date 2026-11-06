/**
 * Tests for the demo extractor used during development.
 * They confirm its output satisfies the same contract as real model output.
 * They also confirm it labels itself, so demo events cannot pass as a real reading.
 */
import { describe, expect, it } from "vitest";
import { finalizeDraft } from "./extraction";
import { createFixtureExtractor } from "./fixtureExtractor";

describe("createFixtureExtractor", () => {
  it("returns a draft that passes the event contract and marks itself as demo data", async () => {
    const extractor = createFixtureExtractor();
    const draft = await extractor.extract("any story", new AbortController().signal);
    const result = finalizeDraft(draft, extractor.isDemo);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.isDemo).toBe(true);
  });
});
