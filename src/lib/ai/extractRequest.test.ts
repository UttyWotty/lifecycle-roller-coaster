/**
 * Tests for the extraction request handler using a fake extractor.
 * They confirm bad requests stop before any provider call, which protects paid API usage.
 * They also confirm provider failures map to safe responses that never include the story.
 */
import { describe, expect, it, vi } from "vitest";
import { MAX_STORY_LENGTH } from "@/lib/story/storyInput";
import { ExtractionError, type ExtractionErrorCode } from "./errors";
import type { ExtractionDraft } from "./extraction";
import type { EventExtractor } from "./extractor";
import { errorResponse, handleExtractRequest } from "./extractRequest";

const JSON_TYPE = "application/json";
const SECRET_STORY = "ZZSECRETSTORYZZ I started university in 2015.";
const DRAFT: ExtractionDraft = {
  events: [
    {
      date: "2015",
      title: "Started University",
      description: "Started a new academic journey.",
      category: "education",
      sentiment: "positive",
      impact: 8,
      confidence: 0.95,
    },
  ],
  clarifications: [],
};

function fakeExtractor(result: ExtractionDraft | Error): EventExtractor & { extract: ReturnType<typeof vi.fn> } {
  return {
    isDemo: false,
    extract: vi.fn(async () => {
      if (result instanceof Error) {
        throw result;
      }
      return result;
    }),
  };
}

function run(extractor: EventExtractor, body: string, contentType: string | null = JSON_TYPE) {
  return handleExtractRequest(contentType, body, extractor, new AbortController().signal);
}

describe("handleExtractRequest", () => {
  it("returns events with server-assigned ids", async () => {
    const response = await run(fakeExtractor(DRAFT), JSON.stringify({ story: SECRET_STORY }));
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      events: [{ id: "event_001" }],
      clarifications: [],
      isDemo: false,
    });
  });

  it("marks results from a demo extractor", async () => {
    const extractor = { ...fakeExtractor(DRAFT), isDemo: true };
    const response = await run(extractor, JSON.stringify({ story: "x" }));
    expect(response.body).toMatchObject({ isDemo: true });
  });

  it("trims the story before sending it to the provider", async () => {
    const extractor = fakeExtractor(DRAFT);
    await run(extractor, JSON.stringify({ story: "  my story \n" }));
    expect(extractor.extract).toHaveBeenCalledWith("my story", expect.any(AbortSignal));
  });

  it.each([
    ["charset parameter", "application/json; charset=utf-8"],
    ["uppercase", "APPLICATION/JSON"],
  ])("accepts a JSON content type with %s", async (_label, contentType) => {
    const response = await run(fakeExtractor(DRAFT), JSON.stringify({ story: "x" }), contentType);
    expect(response.status).toBe(200);
  });

  it.each([
    ["no content type", null],
    ["a form", "application/x-www-form-urlencoded"],
    ["plain text", "text/plain"],
  ])("rejects %s before calling the provider", async (_label, contentType) => {
    const extractor = fakeExtractor(DRAFT);
    const response = await run(extractor, JSON.stringify({ story: "x" }), contentType);
    expect(response.status).toBe(415);
    expect(extractor.extract).not.toHaveBeenCalled();
  });

  it.each([
    ["malformed JSON", "{not json"],
    ["an empty body", ""],
    ["a missing story", "{}"],
    ["a non-string story", '{"story": 42}'],
    ["a blank story", '{"story": "   "}'],
    ["JSON null", "null"],
    ["an over-limit story", JSON.stringify({ story: "a".repeat(MAX_STORY_LENGTH + 1) })],
  ])("rejects %s before calling the provider", async (_label, body) => {
    const extractor = fakeExtractor(DRAFT);
    const response = await run(extractor, body);
    expect(response.status).toBe(400);
    expect(extractor.extract).not.toHaveBeenCalled();
  });

  it.each<[ExtractionErrorCode, number]>([
    ["refused", 422],
    ["truncated", 422],
    ["provider_failed", 502],
    ["not_configured", 503],
    ["rate_limited", 503],
  ])("maps %s to status %i with no story text", async (code, status) => {
    const response = await run(
      fakeExtractor(new ExtractionError(code)),
      JSON.stringify({ story: SECRET_STORY }),
    );
    expect(response).toEqual({ status, body: { error: code } });
  });

  it("hides an unexpected error behind a generic code", async () => {
    const response = await run(
      fakeExtractor(new Error(`boom ${SECRET_STORY}`)),
      JSON.stringify({ story: SECRET_STORY }),
    );
    expect(response).toEqual({ status: 502, body: { error: "provider_failed" } });
  });

  it("fails safely when the model returns an invalid draft", async () => {
    const invalid = { events: [{ ...DRAFT.events[0], impact: 99 }], clarifications: [] };
    const response = await run(fakeExtractor(invalid), JSON.stringify({ story: "x" }));
    expect(response.status).toBe(502);
  });
});

describe("errorResponse", () => {
  it("maps an oversized body to status 413", () => {
    expect(errorResponse("payload_too_large")).toEqual({
      status: 413,
      body: { error: "payload_too_large" },
    });
  });
});
