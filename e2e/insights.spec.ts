/**
 * Browser tests for the life features around the ride.
 * They cover chapters, the life report, statistics and each way of sharing.
 * Sharing is tested with stand-ins for the browser's share sheet and clipboard.
 */
import { expect, test } from "@playwright/test";
import { button, openRide, rideStop } from "./helpers";

test("chapters, the report and statistics show, and appear on the ride", async ({ page }) => {
  await openRide(page);
  await expect(page.getByTestId("chapter-bands").getByText("Finding My Feet")).toBeVisible();
  await expect(page.getByRole("region", { name: "Life report" })).toContainText("biggest comeback");
  const stats = page.getByRole("region", { name: "Life statistics" });
  await expect(stats.getByText("Biggest comeback")).toBeVisible();
  await expect(stats.getByText("Lost job during the pandemic to Got married")).toBeVisible();
});

test("statistics update at once when a stop is edited", async ({ page }) => {
  await openRide(page);
  const stats = page.getByRole("region", { name: "Life statistics" });
  await rideStop(page, "Got married").click();
  await page.getByRole("region", { name: "Selected stop" }).getByLabel("How it felt").selectOption("negative");
  await expect(stats.locator("div", { hasText: "Biggest comeback" })).toContainText("Got married to Ran a first marathon");
});

test("sharing uses the device's share sheet when there is one", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    const nav = navigator as Navigator & { sharedFiles?: number };
    nav.canShare = () => true;
    nav.share = async (data) => {
      nav.sharedFiles = data?.files?.length;
    };
  });
  await button(page, "Share my ride").click();
  await expect
    .poll(() => page.evaluate(() => (navigator as Navigator & { sharedFiles?: number }).sharedFiles))
    .toBe(1);
});

test("sharing falls back to copying the image", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    navigator.canShare = () => false;
    Object.defineProperty(navigator, "clipboard", { value: { write: async () => undefined } });
  });
  await button(page, "Share my ride").click();
  await expect(page.getByText("Image copied")).toBeVisible();
});

test("sharing downloads the image as a last resort", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    navigator.canShare = () => false;
    Object.defineProperty(navigator, "clipboard", { value: {} });
  });
  const downloading = page.waitForEvent("download");
  await button(page, "Share my ride").click();
  await downloading;
  await expect(page.getByText("was downloaded instead")).toBeVisible();
});
