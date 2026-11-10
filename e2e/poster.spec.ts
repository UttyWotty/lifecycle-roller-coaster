/**
 * Browser tests for the printable poster.
 * They confirm Download poster saves an A3 landscape PNG at print resolution, held under the canvas limit.
 * They also confirm the picture holds the card colour at its corner and real ride content, in a themed and a plain look.
 */
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { POSTER_HEIGHT, POSTER_WIDTH, posterScale } from "../src/lib/export/poster";
import { STORY_COLORS } from "../src/lib/export/storyCard";
import { button, openRide } from "./helpers";
import { colorDistance, hexToRgb, samplePicture } from "./pngPicture";

const CORNER_TOLERANCE = 6;
const MIN_DISTINCT_COLORS = 10;

async function downloadPoster(page: Page): Promise<Buffer> {
  const downloading = page.waitForEvent("download", { timeout: 60_000 });
  await button(page, "Download poster").click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("my-roller-coaster-poster.png");
  await expect(page.getByText("Your poster was downloaded")).toBeVisible();
  return readFile(await download.path());
}

for (const look of ["Sunny day", "Simple"]) {
  test(`the poster is A3 at print resolution with the ride on it (${look})`, async ({ page }) => {
    test.setTimeout(90_000);
    await openRide(page);
    await page.getByRole("radio", { name: look }).check();
    const picture = await samplePicture(page, await downloadPoster(page), { x: 4, y: 4 });
    const scale = posterScale();
    expect(picture.width).toBe(Math.floor(POSTER_WIDTH * scale));
    expect(picture.height).toBe(Math.floor(POSTER_HEIGHT * scale));
    expect(colorDistance(picture.skyCorner, hexToRgb(STORY_COLORS.card))).toBeLessThan(CORNER_TOLERANCE);
    expect(picture.distinctColors).toBeGreaterThan(MIN_DISTINCT_COLORS);
  });
}
