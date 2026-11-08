/**
 * Browser tests that open each exported image and look at the picture, not only the file signature.
 * Every theme, style and rider is exported, decoded on a canvas and checked for its sky, its wordmark and real content.
 * They also confirm the image is twice the drawing's size, and that each rider changes the picture.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { wordmarkBadgeBox } from "../src/lib/export/rideImage";
import { RIDE_THEME_DETAILS, RIDE_THEMES, type RideTheme } from "../src/lib/scene/themes";
import { button, hasPageOverflow, openRide } from "./helpers";
import { brightness, colorDistance, hexToRgb, samplePicture, type PictureSample } from "./pngPicture";

const EXPORT_SCALE = 2;
const PLAIN_BACKGROUND = "#ffffff";
/** Exports are anti-aliased and the sky is a gradient, so the corner may drift a little from the palette. */
const SKY_TOLERANCE = 12;
/** The badge is a near-white panel, so the export always carries a readable wordmark. */
const MIN_BADGE_BRIGHTNESS = 200;
/** How far inside the badge's left edge to look, which is clear of the wordmark's letters. */
const BADGE_PROBE_INSET = 4;
/** A blank or broken export has one or two colours; every real ride has many more. */
const MIN_DISTINCT_COLORS = 3;
const STYLES = [/Coaster/, /Loop-the-loops/, /Metro map/];
const RIDERS = ["Smiley", "Cat", "Robot", "Astronaut", "Dino", "Ghost"];

interface ExportedRide {
  file: Buffer;
  picture: PictureSample;
  /** The drawing's size, before the export scale. */
  width: number;
  height: number;
}

async function exportRide(page: Page): Promise<ExportedRide> {
  const viewBox = await page.locator('svg[role="group"]').getAttribute("viewBox");
  const [, , width, height] = (viewBox ?? "").split(" ").map(Number);
  const downloading = page.waitForEvent("download");
  await button(page, "Download image").click();
  const file = await readFile(await (await downloading).path());
  const badge = wordmarkBadgeBox(width);
  const probeAt = {
    x: (badge.x + BADGE_PROBE_INSET) * EXPORT_SCALE,
    y: (badge.y + badge.height / 2) * EXPORT_SCALE,
  };
  return { file, picture: await samplePicture(page, file, probeAt), width, height };
}

function expectThemePicture(ride: ExportedRide, theme: RideTheme): void {
  const { picture, width, height } = ride;
  expect(picture.width).toBe(width * EXPORT_SCALE);
  expect(picture.height).toBe(height * EXPORT_SCALE);
  const sky = RIDE_THEME_DETAILS[theme].palette?.skyTop ?? PLAIN_BACKGROUND;
  expect(colorDistance(picture.skyCorner, hexToRgb(sky))).toBeLessThanOrEqual(SKY_TOLERANCE);
  expect(brightness(picture.probe)).toBeGreaterThanOrEqual(MIN_BADGE_BRIGHTNESS);
  expect(picture.distinctColors).toBeGreaterThanOrEqual(MIN_DISTINCT_COLORS);
}

function themeNamed(name: string): RideTheme {
  const theme = RIDE_THEMES.find((option) => RIDE_THEME_DETAILS[option].name === name);
  if (theme === undefined) {
    throw new TypeError(`Unknown theme ${name}`);
  }
  return theme;
}

/** The theme card's title holds the full theme name, even when the card shortens it. */
async function checkedThemeName(page: Page): Promise<string> {
  const label = page.locator("label").filter({ has: page.locator('input[name="ride-theme"]:checked') });
  return (await label.getAttribute("title")) ?? "";
}

test.describe("exported pictures", () => {
  for (const style of STYLES) {
    for (const theme of RIDE_THEMES) {
      const name = RIDE_THEME_DETAILS[theme].name;
      test(`${name} in the ${style.source} style exports its own sky, the wordmark and the ride`, async ({ page }) => {
        await openRide(page);
        await page.getByRole("radio", { name: style }).check();
        await page.getByRole("radio", { name, exact: true }).check();
        expect(await hasPageOverflow(page)).toBe(false);
        expectThemePicture(await exportRide(page), theme);
      });
    }
  }

  test("each rider exports a different picture", async ({ page }) => {
    await openRide(page);
    const fingerprints = new Set<string>();
    for (const rider of RIDERS) {
      await page.getByRole("radio", { name: rider }).check();
      expect(await hasPageOverflow(page)).toBe(false);
      const ride = await exportRide(page);
      expectThemePicture(ride, themeNamed(await checkedThemeName(page)));
      fingerprints.add(createHash("sha256").update(ride.file).digest("hex"));
    }
    expect(fingerprints.size).toBe(RIDERS.length);
  });

  for (const style of STYLES) {
    test(`a titled ride in the ${style.source} style exports at the right size with the title`, async ({ page }) => {
      await openRide(page);
      await page.getByRole("radio", { name: style }).check();
      const untitled = await exportRide(page);
      await page.getByLabel("Name your ride").fill("A long and winding ride");
      expect(await hasPageOverflow(page)).toBe(false);
      const titled = await exportRide(page);
      expect(titled.height).toBeGreaterThan(untitled.height);
      expectThemePicture(titled, themeNamed(await checkedThemeName(page)));
    });
  }
});
