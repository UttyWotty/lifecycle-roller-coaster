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
});
