/**
 * Tests for the in-memory limit store.
 * They confirm counters add up, keep separate keys apart, and reset after their time runs out.
 * The clock is injected, so expiry is tested without waiting.
 */
import { describe, expect, it } from "vitest";
import { createMemoryLimitStore } from "./memoryLimitStore";

describe("memory limit store", () => {
  it("adds up and keeps keys apart", async () => {
    const store = createMemoryLimitStore();
    expect(await store.increment("a", 2, 60)).toBe(2);
    expect(await store.increment("a", 3, 60)).toBe(5);
    expect(await store.increment("b", 1, 60)).toBe(1);
  });

  it("starts again after the time runs out", async () => {
    let time = 0;
    const store = createMemoryLimitStore(() => time);
    await store.increment("a", 5, 10);
    time = 10_001;
    expect(await store.increment("a", 1, 10)).toBe(1);
  });
});
