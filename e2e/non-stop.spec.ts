/**
 * Browser tests for Non-stop, which makes Ride it roll through every stop instead of pausing at each.
 * They confirm the choice starts off and is remembered on the device, and that a stopping ride holds still at a stop.
 * They also confirm a non-stop ride keeps moving as it reaches a stop, still shows each stop's story, and finishes.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

/** Long enough to see the cart move, and well inside a stopping ride's pause at a stop. */
const WATCH_MS = 400;

function panel(page: Page) {
  return page.getByRole("region", { name: "Ride it" });
}

/** Whether the cart moves during a short watch, starting the moment the ride shows its first stop. */
async function movesAtFirstStop(page: Page): Promise<boolean> {
  await button(page, "Ride it").click();
  await expect(panel(page).getByText(/^Stop 1 of \d+/)).toBeVisible({ timeout: 10_000 });
  const cart = page.getByTestId("playback-cart");
  const before = await cart.getAttribute("transform");
  await page.waitForTimeout(WATCH_MS);
  return (await cart.getAttribute("transform")) !== before;
}

test("Non-stop starts off and is remembered once turned on", async ({ page }) => {
  await openRide(page);
  await expect(button(page, "Non-stop")).toHaveAttribute("aria-pressed", "false");
  await button(page, "Non-stop").click();
  await expect(button(page, "Non-stop")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(button(page, "Non-stop")).toHaveAttribute("aria-pressed", "true");
});

test("a stopping ride holds still at a stop", async ({ page }) => {
  await openRide(page);
  expect(await movesAtFirstStop(page)).toBe(false);
});

test("a non-stop ride rolls through each stop, shows its story and finishes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openRide(page);
  await button(page, "Non-stop").click();
  expect(await movesAtFirstStop(page)).toBe(true);
  await expect(panel(page).getByText(/^Stop 2 of \d+/)).toBeVisible({ timeout: 10_000 });
  await button(page, "Next").click();
  await expect(panel(page).getByText(/^Stop 3 of \d+/)).toBeVisible();
  await expect(panel(page).getByText("End of the ride")).toBeVisible({ timeout: 60_000 });
  expect(errors).toEqual([]);
});
