/**
 * Tests for the public-access adapter, loaded fresh with different environment settings.
 * They confirm a Vercel deployment without a limit store fails closed and that visitor ids never hold an address.
 * They also confirm the bot check runs only on Vercel and blocks when the check itself fails.
 * Each test reloads the module, so error classes are matched by name rather than by identity.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const checkBotId = vi.fn();
vi.mock("botid/server", () => ({ checkBotId }));

const NO_STORE = { KV_REST_API_URL: "", KV_REST_API_TOKEN: "", UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "" };
const ADDRESS = "203.0.113.7";

async function loadWith(env: Record<string, string>): Promise<typeof import("./publicAccess")> {
  vi.resetModules();
  for (const [name, value] of Object.entries({ ...NO_STORE, VERCEL: "", RATE_LIMIT_SECRET: "", DAILY_BUDGET_USD: "", ...env })) {
    vi.stubEnv(name, value);
  }
  return import("./publicAccess");
}

afterEach(() => {
  vi.unstubAllEnvs();
  checkBotId.mockReset();
});

describe("public access", () => {
  it("fails closed on Vercel when no limit store is configured", async () => {
    const access = await loadWith({ VERCEL: "1" });
    await expect(access.limitStore.increment("k", 1, 60)).rejects.toMatchObject({ name: "LimitStoreError" });
  });

  it("counts in memory off Vercel", async () => {
    const access = await loadWith({});
    expect(await access.limitStore.increment("k", 2, 60)).toBe(2);
  });

  it("hashes the address into a fixed-length id that does not contain it", async () => {
    const access = await loadWith({ RATE_LIMIT_SECRET: "s1" });
    const id = access.visitorIdFor(new Headers({ "x-vercel-forwarded-for": ADDRESS }));
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(id).not.toContain(ADDRESS);
    expect(access.visitorIdFor(new Headers({ "x-forwarded-for": `${ADDRESS}, 10.0.0.1` }))).toBe(id);
    const other = await loadWith({ RATE_LIMIT_SECRET: "s2" });
    expect(other.visitorIdFor(new Headers({ "x-vercel-forwarded-for": ADDRESS }))).not.toBe(id);
  });

  it("reads the daily budget, falling back to one dollar", async () => {
    expect((await loadWith({})).DAILY_BUDGET_MICRO_USD).toBe(1_000_000);
    expect((await loadWith({ DAILY_BUDGET_USD: "0.5" })).DAILY_BUDGET_MICRO_USD).toBe(500_000);
  });

  it("skips the bot check off Vercel", async () => {
    expect(await (await loadWith({})).isAutomatedRequest()).toBe(false);
    expect(checkBotId).not.toHaveBeenCalled();
  });

  it("blocks bots on Vercel, and blocks when the check fails", async () => {
    const access = await loadWith({ VERCEL: "1" });
    checkBotId.mockResolvedValueOnce({ isBot: true });
    expect(await access.isAutomatedRequest()).toBe(true);
    checkBotId.mockResolvedValueOnce({ isBot: false });
    expect(await access.isAutomatedRequest()).toBe(false);
    checkBotId.mockRejectedValueOnce(new TypeError("no token"));
    expect(await access.isAutomatedRequest()).toBe(true);
  });
});
