/**
 * Tests for the feedback stores, with fetch replaced by a stub for the Upstash list.
 * They confirm the exact LPUSH and LTRIM pipeline, newest-first trimming in memory, and that failures are reported.
 * A failure must never look like a kept message, so the visitor can try again.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { FEEDBACK_LIST_KEY, KEPT_FEEDBACK, type FeedbackRecord } from "./feedback";
import { FeedbackStoreError, createMemoryFeedbackStore, createUpstashFeedbackStore, unconfiguredFeedbackStore } from "./feedbackStore";

const RECORD: FeedbackRecord = { reaction: "loved", message: "Nice", locale: "en", day: "2026-11-11", build: "abc" };
const SETTINGS = { url: "https://example.upstash.io", token: "secret-token" };

function stubFetch(response: Response | Error): ReturnType<typeof vi.fn> {
  const fetchStub = vi.fn(async () => {
    if (response instanceof Error) {
      throw response;
    }
    return response;
  });
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("upstash feedback store", () => {
  it("pushes the record and trims the list in one pipeline call", async () => {
    const fetchStub = stubFetch(Response.json([{ result: 1 }, { result: "OK" }]));
    await createUpstashFeedbackStore(SETTINGS).add(RECORD);
    const [url, init] = fetchStub.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(JSON.parse(String(init.body))).toEqual([
      ["LPUSH", FEEDBACK_LIST_KEY, JSON.stringify(RECORD)],
      ["LTRIM", FEEDBACK_LIST_KEY, "0", String(KEPT_FEEDBACK - 1)],
    ]);
  });

  it.each([
    ["an error status", new Response("no", { status: 401 })],
    ["a network failure", new TypeError("fetch failed")],
    ["an error reply", Response.json([{ error: "ERR" }, { result: "OK" }])],
    ["an unexpected shape", Response.json({ result: 1 })],
  ])("turns %s into FeedbackStoreError", async (_label, response) => {
    stubFetch(response);
    await expect(createUpstashFeedbackStore(SETTINGS).add(RECORD)).rejects.toBeInstanceOf(FeedbackStoreError);
  });
});

describe("memory and unconfigured stores", () => {
  it("keeps the newest messages first, up to the limit", async () => {
    const store = createMemoryFeedbackStore();
    for (let index = 0; index <= KEPT_FEEDBACK; index += 1) {
      await store.add({ ...RECORD, message: String(index) });
    }
    expect(store.records).toHaveLength(KEPT_FEEDBACK);
    expect(store.records[0].message).toBe(String(KEPT_FEEDBACK));
  });

  it("refuses every message when no store is configured", async () => {
    await expect(unconfiguredFeedbackStore.add(RECORD)).rejects.toBeInstanceOf(FeedbackStoreError);
  });
});
