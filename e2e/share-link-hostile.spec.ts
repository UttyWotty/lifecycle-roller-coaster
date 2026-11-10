/**
 * Browser tests that attack the shared ride page with hostile links.
 * They confirm hostile titles render as plain text, nothing throws, nothing is saved, and the viewer's own saved ride survives.
 * They also confirm private fields stay out of links after editing and inside a lens, and that the fragment never reaches the server.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide, SECRET } from "./helpers";

const SAVED_KEY = "lifecycle-roller-coaster:rides";

function pack(value: unknown, raw = false): string {
  const text = raw ? (value as string) : JSON.stringify(value);
  return `r=${Buffer.from(text, "utf8").toString("base64url")}`;
}

const GOOD = { v: 1, t: "T", s: "coaster", h: "classic", r: "cat", e: [["A", "2020", 0, 0, 5], ["B", "", 1, 1, 8]], c: [["Ch", [0, 1, 99]]] };

async function watch(page: Page): Promise<{ errors: string[]; urls: string[]; dialogs: string[] }> {
  const seen = { errors: [] as string[], urls: [] as string[], dialogs: [] as string[] };
  page.on("pageerror", (error) => seen.errors.push(error.message));
  page.on("request", (request) => seen.urls.push(request.url()));
  page.on("dialog", async (dialog) => {
    seen.dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  return seen;
}

test("hostile titles render as text, nothing is saved, the viewer's ride is untouched", async ({ page }) => {
  await openRide(page);
  const before = await page.evaluate((key) => window.localStorage.getItem(key), SAVED_KEY);
  expect(before).not.toBeNull();
  const seen = await watch(page);
  const evil = "<img src=x onerror=alert(1)><script>x</script>";
  const link = `/ride#${pack({ ...GOOD, t: evil, e: [[evil, "2020", 0, 0, 5], ["</title><svg onload=alert(3)>", "", 1, 1, 8]], c: [[evil, [0, 1]]] })}`;
  await page.goto(link);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("<img src=x");
  await page.waitForTimeout(500);
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  expect(await page.locator("main script").count()).toBe(0);
  expect(await page.locator("svg[onload]").count()).toBe(0);
  expect(seen.dialogs).toEqual([]);
  expect(seen.errors).toEqual([]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), SAVED_KEY)).toBe(before);
  expect(await page.evaluate(() => window.sessionStorage.length)).toBe(0);
  expect(seen.urls.filter((url) => url.includes("#") || url.includes("r="))).toEqual([]);
});

test("hostile and malformed fragments never throw or save", async ({ page }) => {
  const seen = await watch(page);
  const raw = JSON.stringify(GOOD);
  const fragments = [
    "r=" + "A".repeat(50000),
    pack("[".repeat(100000) + "]".repeat(100000), true),
    pack(raw.replace("{", '{"__proto__":{"x":1},'), true),
    pack({ ...GOOD, e: [["A", "9999-99-99", 0, 0, 5]] }),
    pack({ ...GOOD, e: [["A", "2020", 0, 0, 1e21]] }),
    pack({ ...GOOD, c: [["Ch", [-5]]] }),
    pack({ ...GOOD, e: Array.from({ length: 100 }, (_, i) => [`E${i}`, `${1900 + i}`, i % 9, i % 3, 1 + (i % 10)]) }),
    "r=%E0%A4%A", "r=%00%00", "r=‮", "r=" + "%ff".repeat(100), "R=abc", "r=r=r=",
  ];
  for (const fragment of fragments) {
    await page.goto("/ride#" + fragment);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await page.goto("/ride#" + pack(GOOD));
  await page.evaluate(() => { window.location.hash = "r=garbage"; });
  await expect(page.getByRole("heading", { name: "This ride link does not work" })).toBeVisible();
  expect(seen.errors).toEqual([]);
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
});

test("private fields never enter a link, even after edits and in a lens", async ({ page }) => {
  await openRide(page);
  await button(page, "Edit my events").click();
  const desc = page.getByLabel("Description").first();
  if (await desc.count()) await desc.fill("PRIVATEDESCRIPTIONXYZ");
  await page.getByLabel("Title").first().fill("Edited title");
  await button(page, "See my ride").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await page.getByRole("radio", { name: "2020s", exact: true }).check();
  await button(page, "Share a link").click();
  const link = await page.getByRole("textbox", { name: "Link to your ride" }).inputValue();
  const payload = Buffer.from(link.split("#r=")[1], "base64url").toString("utf8");
  expect(payload).not.toContain("PRIVATE");
  expect(payload).not.toContain(SECRET);
  expect(Object.keys(JSON.parse(payload)).sort()).toEqual(["c", "e", "h", "r", "s", "t", "v"]);
  for (const event of JSON.parse(payload).e) expect(event).toHaveLength(5);
});

test("shared page works on a phone: style, theme, export, no overflow", async ({ page }) => {
  const seen = await watch(page);
  await page.goto("/ride#" + pack(GOOD));
  await page.getByRole("radio", { name: /Metro/ }).check();
  await expect(page.locator('svg[role="group"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download/ }).first().click()]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
  expect(seen.errors).toEqual([]);
});

test("share sheet branch uses navigator.share when present", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __shared: unknown }).__shared = null;
    navigator.share = async (data) => { (window as unknown as { __shared: unknown }).__shared = data; };
  });
  await openRide(page);
  await button(page, "Share a link").click();
  await page.getByRole("button", { name: "Share..." }).click();
  const data = await page.evaluate(() => (window as unknown as { __shared: { url: string } }).__shared);
  expect(data.url).toContain("/ride#r=");
});

test("preview metadata on /ride and home", async ({ page }) => {
  for (const path of ["/", "/ride"]) {
    await page.goto(path);
    expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
    expect(await page.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
  }
});
