/**
 * Browser tests for the life features around the ride.
 * They cover chapters, the life report, statistics and each way of sharing.
 * Sharing is tested with stand-ins for the browser's share sheet and clipboard.
 */
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { button, openRide, rideStop } from "./helpers";

/** Where a PNG stores its width and height, in its header chunk. */
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

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

type SharedPayload = { files: string[]; text: string };

test("sharing sends the story picture and the ride's link to the share sheet", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    const nav = navigator as Navigator & { shared?: SharedPayload };
    nav.canShare = () => true;
    nav.share = async (data) => {
      nav.shared = { files: (data?.files ?? []).map((file) => `${file.name} ${file.type}`), text: data?.text ?? "" };
    };
  });
  await button(page, "Share my ride").click();
  await expect
    .poll(() => page.evaluate(() => (navigator as Navigator & { shared?: SharedPayload }).shared?.files))
    .toEqual(["my-roller-coaster-story.png image/png"]);
  const text = await page.evaluate(() => (navigator as Navigator & { shared?: SharedPayload }).shared?.text ?? "");
  expect(text).toMatch(/^Take a ride through .*\/ride#r=[\w-]+$/);
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
  const download = await downloading;
  await expect(page.getByText("was downloaded instead")).toBeVisible();
  expect(download.suggestedFilename()).toBe("my-roller-coaster-story.png");
  const png = readFileSync(await download.path());
  expect([png.readUInt32BE(PNG_WIDTH_OFFSET), png.readUInt32BE(PNG_HEIGHT_OFFSET)]).toEqual([1080, 1920]);
});
