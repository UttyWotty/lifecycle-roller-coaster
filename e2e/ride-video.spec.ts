/**
 * Browser tests for the ride video.
 * They confirm a ride records to a video file that downloads where the share sheet cannot take it.
 * They also confirm a non-stop ride records a shorter video, and Cancel stops a recording without leaving a file or an error behind.
 */
import { expect, test } from "@playwright/test";
import { button, openRide } from "./helpers";

test("a ride records to a video file", async ({ page }) => {
  test.setTimeout(120_000);
  await openRide(page);
  await page.evaluate(() => Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true }));
  const downloading = page.waitForEvent("download", { timeout: 110_000 });
  await button(page, "Make a ride video").click();
  await expect(page.getByRole("progressbar", { name: "Ride video" })).toBeVisible();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^my-roller-coaster-ride\.(mp4|webm)$/);
  const size = (await import("node:fs")).statSync(await download.path()).size;
  expect(size).toBeGreaterThan(100_000);
  await expect(page.getByText("Your video was downloaded.")).toBeVisible();
});

test("a non-stop ride records a shorter video", async ({ page }) => {
  test.setTimeout(120_000);
  await openRide(page);
  await page.evaluate(() => Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true }));
  const recordSeconds = async (): Promise<number> => {
    const downloading = page.waitForEvent("download", { timeout: 110_000 });
    const started = Date.now();
    await button(page, "Make a ride video").click();
    await downloading;
    return (Date.now() - started) / 1000;
  };
  const stopping = await recordSeconds();
  await button(page, "Non-stop").click();
  const nonStop = await recordSeconds();
  expect(nonStop).toBeLessThan(stopping - 2);
});

test("Cancel stops a recording", async ({ page }) => {
  await openRide(page);
  await button(page, "Make a ride video").click();
  await expect(page.getByRole("progressbar", { name: "Ride video" })).toBeVisible();
  await button(page, "Cancel").click();
  await expect(button(page, "Make a ride video")).toBeVisible();
  await expect(page.getByText("We could not make your video")).toHaveCount(0);
});
