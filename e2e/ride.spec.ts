/**
 * Browser tests for the ride stage and image export.
 * They confirm the track redraws at once, stops work from the keyboard, and edits survive going back.
 * They also read the downloaded file to prove it is a real PNG of the expected size.
 */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { button, eventCard, hasPageOverflow, openRide, rideStop } from "./helpers";

const PNG_SIGNATURE = "PNG";
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const EXPORT_SCALE = 2;

test("the ride shows every event, the legend and the creative note", async ({ page }) => {
  await openRide(page);
  await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
  await expect(page.getByRole("list", { name: "Marker colours" }).locator("li")).toHaveCount(4);
  await expect(page.getByText("not a measurement of your life")).toBeVisible();
});

test("changing a stop redraws the track at once", async ({ page }) => {
  await openRide(page);
  const path = page.getByTestId("ride-path");
  const original = await path.getAttribute("d");
  await rideStop(page, "Lost job").click();
  const details = page.getByRole("region", { name: "Selected stop" });
  await expect(details.getByRole("heading")).toHaveText("Lost job during the pandemic");
  await details.getByLabel("How it felt").selectOption("positive");
  await expect(path).not.toHaveAttribute("d", original ?? "");
  const afterSentiment = await path.getAttribute("d");
  await details.locator("input[type=range]").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(path).not.toHaveAttribute("d", afterSentiment ?? "");
});

test("stops can be selected from the keyboard", async ({ page }) => {
  await openRide(page);
  const details = page.getByRole("region", { name: "Selected stop" });
  await rideStop(page, "Started university").focus();
  await page.keyboard.press("Enter");
  await expect(details.getByRole("heading")).toHaveText("Started university");
  await rideStop(page, "Got married").focus();
  await page.keyboard.press("Space");
  await expect(details.getByRole("heading")).toHaveText("Got married");
  await expect(rideStop(page, "Got married")).toHaveAttribute("aria-pressed", "true");
});

test("ride edits are kept when going back", async ({ page }) => {
  await openRide(page);
  await rideStop(page, "Lost job").click();
  await page.getByRole("region", { name: "Selected stop" }).getByLabel("How it felt").selectOption("neutral");
  await button(page, "Edit my events").click();
  await expect(eventCard(page, 2).getByLabel("How it felt")).toHaveValue("neutral");
});

test("a long title is shortened on the track and shown in full in the details", async ({ page }) => {
  await openRide(page);
  await button(page, "Edit my events").click();
  await eventCard(page, 1).getByLabel("Title").fill("T".repeat(120));
  await button(page, "See my ride").click();
  const stop = rideStop(page, "TTT");
  await expect(stop.locator("text").first()).toHaveText(`${"T".repeat(19)}...`);
  await stop.click();
  await expect(page.getByRole("region", { name: "Selected stop" }).getByRole("heading")).toHaveText(
    "T".repeat(120),
  );
});

test("the track scrolls in its own area on a phone", async ({ page }) => {
  await openRide(page);
  expect(await hasPageOverflow(page)).toBe(false);
  const region = page.getByRole("region", { name: /Roller coaster/ });
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test("the draw-in animation runs by default", async ({ page }) => {
  await openRide(page);
  const name = await page.getByTestId("ride-path").evaluate((path) => getComputedStyle(path).animationName);
  expect(name).toBe("ride-track-draw");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the draw-in animation is off", async ({ page }) => {
    await openRide(page);
    const name = await page.getByTestId("ride-path").evaluate((path) => getComputedStyle(path).animationName);
    expect(name).toBe("none");
  });
});

test("the image downloads as a PNG at twice the track size, with no upload", async ({ page }) => {
  await openRide(page);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("http")) {
      requests.push(request.url());
    }
  });
  const downloading = page.waitForEvent("download");
  await button(page, "Download image").click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("my-roller-coaster.png");
  const file = await readFile(await download.path());
  expect(file.subarray(1, 4).toString()).toBe(PNG_SIGNATURE);
  const viewBox = await page
    .getByRole("group", { name: "Your life as a roller coaster" })
    .getAttribute("viewBox");
  const [, , width, height] = (viewBox ?? "").split(" ").map(Number);
  expect(file.readUInt32BE(PNG_WIDTH_OFFSET)).toBe(width * EXPORT_SCALE);
  expect(file.readUInt32BE(PNG_HEIGHT_OFFSET)).toBe(height * EXPORT_SCALE);
  expect(requests).toEqual([]);
});

test("a failed export shows a friendly message and can be retried", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
  });
  await button(page, "Download image").click();
  await expect(page.getByText("could not create your image")).toBeVisible();
  await expect(button(page, "Download image")).toBeEnabled();
});
