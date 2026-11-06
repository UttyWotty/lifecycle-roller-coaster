/**
 * Browser-free tests for the extraction endpoint on the production server.
 * They confirm bad requests are rejected before any provider call, including oversized bodies.
 * They also confirm the test server runs in demo mode, so this suite can never spend tokens.
 */
import { expect, test } from "@playwright/test";

const ENDPOINT = "/api/extract";
const JSON_HEADERS = { "Content-Type": "application/json" };

test("the test server returns labelled demo data", async ({ request }) => {
  const response = await request.post(ENDPOINT, {
    headers: JSON_HEADERS,
    data: { story: "Any story" },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.clarifications[0]).toContain("Demo data");
  expect(body.events[0].id).toBe("event_001");
});

test("a non-JSON content type is rejected", async ({ request }) => {
  const response = await request.post(ENDPOINT, {
    headers: { "Content-Type": "text/plain" },
    data: '{"story":"x"}',
  });
  expect(response.status()).toBe(415);
  expect(await response.json()).toEqual({ error: "unsupported_media_type" });
});

for (const [label, data] of [
  ["malformed JSON", "{nope"],
  ["a missing story", "{}"],
  ["a blank story", '{"story":"   "}'],
  ["an over-limit story", JSON.stringify({ story: "a".repeat(20_001) })],
] as const) {
  test(`${label} is rejected`, async ({ request }) => {
    const response = await request.post(ENDPOINT, { headers: JSON_HEADERS, data });
    expect(response.status()).toBe(400);
  });
}

test("an oversized body is rejected", async ({ request }) => {
  const response = await request.post(ENDPOINT, {
    headers: JSON_HEADERS,
    data: "a".repeat(2_000_000),
  });
  expect(response.status()).toBe(413);
});
