/**
 * Browser tests for the art modes added after the first sixteen themes, one test per look.
 * Each opens the fixture ride, picks the look and checks the drawing has that look's own parts.
 * They keep ride.spec.ts small, and never need an AI provider because the fixture extractor is forced on.
 */
import { expect, test } from "@playwright/test";
import { openRide } from "./helpers";

test.describe("new looks", () => {
  test("Comic Book draws panels, bursts and a speech bubble for every stop", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Comic Book", exact: true }).check();
    const stops = await page.locator('svg g[role="button"]').count();
    await expect(page.getByTestId("comic-panel").first()).toBeAttached();
    await expect(page.getByTestId("comic-bubble-tail")).toHaveCount(stops);
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Comic Book bursts only over stops reached by a big move", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Comic Book", exact: true }).check();
    const bursts = page.getByTestId("comic-burst");
    const count = await bursts.count();
    expect(count).toBeLessThan(await page.locator('svg g[role="button"]').count());
    for (let index = 0; index < count; index += 1) {
      await expect(bursts.nth(index)).toHaveAttribute("data-mood", /^(drop|climb)$/);
    }
  });

  test("8-Bit Life stacks block pillars on grass and flies banners only over big moves", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "8-Bit Life", exact: true }).check();
    const stops = await page.locator('svg g[role="button"]').count();
    await expect(page.getByTestId("pixel-pillar").first()).toBeAttached();
    await expect(page.getByTestId("pixel-grass")).toHaveCount(1);
    await expect(page.getByTestId("pixel-cloud").first()).toBeAttached();
    const banners = page.getByTestId("pixel-banner");
    const count = await banners.count();
    expect(count).toBeLessThan(stops);
    for (let index = 0; index < count; index += 1) {
      const mood = await banners.nth(index).getAttribute("data-mood");
      await expect(banners.nth(index)).toHaveText(mood === "climb" ? "LEVEL UP!" : "CHECKPOINT");
    }
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Dreamland floats a jelly cart on a cloud floor under rainbows and sparkles", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Dreamland", exact: true }).check();
    await expect(page.getByTestId("dream-cloud-floor")).toHaveCount(1);
    await expect(page.getByTestId("dream-rainbow").first()).toBeAttached();
    await expect(page.getByTestId("dream-sparkle").first()).toBeAttached();
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").getByTestId("dream-cart")).toHaveCount(1);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Watercolor paints hill washes, soft clouds and paper grain", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Watercolor", exact: true }).check();
    await expect(page.getByTestId("watercolor-hill")).toHaveCount(3);
    await expect(page.getByTestId("watercolor-cloud").first()).toBeAttached();
    await expect(page.getByTestId("watercolor-paper")).toHaveCount(1);
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Building blocks stacks brick columns on a studded baseplate with a brick cart", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Building blocks", exact: true }).check();
    await expect(page.getByTestId("brick-column").first()).toBeAttached();
    await expect(page.getByTestId("brick-baseplate")).toHaveCount(1);
    await expect(page.getByTestId("brick-tree").first()).toBeAttached();
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").getByTestId("brick-cart")).toHaveCount(1);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Surreal dream floats boulders over a plain with doorways, wisps and long shadows", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Surreal dream", exact: true }).check();
    await expect(page.getByTestId("surreal-plain")).toHaveCount(1);
    await expect(page.getByTestId("surreal-rock").first()).toBeAttached();
    await expect(page.getByTestId("surreal-door").first()).toBeAttached();
    await expect(page.getByTestId("surreal-wisp")).toHaveCount(2);
    await expect(page.getByTestId("surreal-shadow").first()).toBeAttached();
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Track map prints a white line on black with a spec sheet under it", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Track map", exact: true }).check();
    await expect(page.getByTestId("trackmap-frame")).toHaveCount(1);
    await expect(page.getByTestId("trackmap-spec")).toHaveCount(1);
    await expect(page.getByTestId("trackmap-fact").first()).toHaveAttribute("data-fact", "years");
    await expect(page.getByTestId("trackmap-fact").first()).toContainText("YEARS");
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("Isometric model stands box pillars and a solid rail on a tiled slab", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Isometric model", exact: true }).check();
    await expect(page.getByTestId("iso-slab")).toHaveCount(1);
    await expect(page.getByTestId("iso-pillar").first()).toBeAttached();
    await expect(page.getByTestId("iso-box").first()).toBeAttached();
    await expect(page.getByTestId("iso-rail-depth")).toHaveCount(1);
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });
});
