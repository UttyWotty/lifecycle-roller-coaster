/**
 * Tests for the Upstash adapter with fetch replaced by a stub, since the real service is outside the test run.
 * They confirm the exact pipeline request, reading the new total, and that every failure becomes LimitStoreError.
 * A failure must never look like a successful count, because that would let spending through.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { LimitStoreError } from "./limitStore";
import { createUpstashLimitStore } from "./upstashLimitStore";

const SETTINGS = { url: "https://example.upstash.io/", token: "secret-token" };

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

describe("upstash limit store", () => {
  it("sends INCRBY and EXPIRE in one pipeline call and returns the new total", async () => {
    const fetchStub = stubFetch(Response.json([{ result: 7 }, { result: 1 }]));
    expect(await createUpstashLimitStore(SETTINGS).increment("lrc:budget:2026-11-09", 5, 60)).toBe(7);
    const [url, init] = fetchStub.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer secret-token");
    expect(JSON.parse(String(init.body))).toEqual([
      ["INCRBY", "lrc:budget:2026-11-09", "5"],
      ["EXPIRE", "lrc:budget:2026-11-09", "60"],
    ]);
  });

  it.each([
    ["an error status", new Response("no", { status: 401 })],
    ["a network failure", new TypeError("fetch failed")],
    ["an error reply", Response.json([{ error: "ERR wrong type" }, { result: 0 }])],
    ["an unexpected shape", Response.json({ result: 3 })],
  ])("turns %s into LimitStoreError", async (_label, response) => {
    stubFetch(response);
    await expect(createUpstashLimitStore(SETTINGS).increment("k", 1, 60)).rejects.toBeInstanceOf(LimitStoreError);
  });
});
