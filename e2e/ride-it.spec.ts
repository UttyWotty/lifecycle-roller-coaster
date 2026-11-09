/**
 * Browser tests for Ride it, the guided playback of a ride.
 * They confirm the cart rides and stops at each event with its story, and that every control works by button and key.
 * They also confirm the ride ends on the report, styles without a cart still step through stops, and exports stay clean.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

function panel(page: Page) {
  return page.getByRole("region", { name: "Ride it" });
}

async function startRide(page: Page): Promise<void> {
  await button(page, "Ride it").click();
  await expect(panel(page)).toBeVisible();
}

test("the cart rides to the first stop and shows its story", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  await expect(panel(page).getByText(/^Stop 1 of \d+/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("playback-cart")).toHaveAttribute("transform", /translate/);
  await expect(page.getByTestId("ride-cart-moving")).toBeHidden();
  await expect(page.getByTestId("ride-cart-parked")).toBeHidden();
});

test("buttons move between stops and exit", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  await button(page, "Next").click();
  await expect(panel(page).getByText(/^Stop 1 of/)).toBeVisible();
  await button(page, "Next").click();
  await expect(panel(page).getByText(/^Stop 2 of/)).toBeVisible();
  await button(page, "Back").click();
  await expect(panel(page).getByText(/^Stop 1 of/)).toBeVisible();
  await button(page, "Pause").click();
  await expect(button(page, "Play")).toBeVisible();
  await button(page, "Exit ride").click();
  await expect(panel(page)).toHaveCount(0);
  await expect(button(page, "Ride it")).toBeVisible();
});

test("keys control the ride, but not while typing", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(panel(page).getByText(/^Stop 2 of/)).toBeVisible();
  await page.getByRole("textbox", { name: "Name your ride" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(panel(page).getByText(/^Stop 2 of/)).toBeVisible();
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
});

test("the ride ends on the life report and can ride again", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  const total = Number((await page.locator('svg g[role="button"]').count()).toString());
  for (let stop = 0; stop <= total; stop += 1) {
    await button(page, "Next").click();
  }
  await expect(panel(page).getByText("End of the ride")).toBeVisible();
  await button(page, "Ride again").click();
  await expect(panel(page).getByText("End of the ride")).toHaveCount(0);
});

test("the metro map steps through stations without a cart", async ({ page }) => {
  await openRide(page);
  await page.getByRole("radio", { name: /Metro map/ }).check();
  await startRide(page);
  await button(page, "Next").click();
  await expect(panel(page).getByText(/^Stop 1 of/)).toBeVisible();
  await expect(page.getByTestId("playback-cart")).toHaveCount(0);
});

test("changing the style ends the ride", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  await page.getByRole("radio", { name: /Loop-the-loops/ }).check();
  await expect(panel(page)).toHaveCount(0);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("jumps straight to the first stop", async ({ page }) => {
    await openRide(page);
    await startRide(page);
    await expect(panel(page).getByText(/^Stop 1 of/)).toBeVisible({ timeout: 1_000 });
  });
});

test("an export taken during a ride has no playback cart", async ({ page }) => {
  await openRide(page);
  await startRide(page);
  const markup = await page.locator('svg[role="group"]').evaluate((svg) => svg.outerHTML);
  expect(markup).not.toContain("playback-cart");
});

test("the exported image is identical during a ride and before it", async ({ page }) => {
  await openRide(page);
  const download = async (): Promise<Buffer> => {
    const pending = page.waitForEvent("download");
    await button(page, "Download image").click();
    const path = await (await pending).path();
    return (await import("node:fs")).readFileSync(path);
  };
  const before = await download();
  await startRide(page);
  const during = await download();
  expect(during.equals(before)).toBe(true);
});
