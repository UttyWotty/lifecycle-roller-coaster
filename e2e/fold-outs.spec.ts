/**
 * Browser tests for the ride screen's folded-away sections, seen by a first-time visitor with nothing stored.
 * They confirm the ride and Ride it come first, every extra is one tap away, and sections open by mouse and keyboard.
 * They also confirm the user's own ride remembers what was left open, while a shared ride's page stores nothing.
 */
import { expect, test, type Page } from "@playwright/test";
import { EMPTY_STORAGE, button, clearStorage, openRide } from "./helpers";

test.use({ storageState: EMPTY_STORAGE });

function section(page: Page, name: string) {
  return page.locator("summary", { hasText: name });
}

test("a first visit shows the ride and Ride it, with the extras folded away", async ({ page }) => {
  await openRide(page);
  await expect(page.locator('svg[role="group"]')).toBeVisible();
  await expect(button(page, "Ride it")).toBeVisible();
  await expect(button(page, "Make it yours")).toHaveAttribute("aria-expanded", "false");
  for (const name of ["Edit", "Ride options", "Share", "More about your ride"]) {
    await expect(section(page, name)).toBeVisible();
  }
  for (const hidden of ["Edit my events", "Sound", "Download image", "Share a link"]) {
    await expect(button(page, hidden)).toBeHidden();
  }
  await expect(page.getByRole("radio", { name: "Metro map" })).toBeHidden();
  await expect(page.getByLabel("Name your ride")).toBeHidden();
  await expect(page.getByRole("region", { name: "Life statistics" })).toBeHidden();
});

test("on a phone the drawing starts on the first screen", async ({ page }) => {
  await page.goto("/sample");
  const drawing = await page.locator('svg[role="group"]').boundingBox();
  const viewport = page.viewportSize();
  expect(drawing?.y ?? Infinity).toBeLessThan((viewport?.height ?? 0) / 2);
});

test("each section opens in place, by mouse and by keyboard", async ({ page }) => {
  await openRide(page);
  await section(page, "Share").click();
  await expect(button(page, "Download image")).toBeVisible();
  await section(page, "Ride options").focus();
  await page.keyboard.press("Enter");
  await expect(button(page, "Sound")).toBeVisible();
  await button(page, "Make it yours").click();
  await expect(button(page, "Make it yours")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("radio", { name: "Metro map" })).toBeVisible();
  await expect(page.getByLabel("Name your ride")).toBeVisible();
});

test("my own ride remembers which sections I left open", async ({ page }) => {
  await openRide(page);
  await section(page, "More about your ride").click();
  await button(page, "Make it yours").click();
  await page.reload();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await expect(page.getByRole("region", { name: "Life statistics" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Metro map" })).toBeVisible();
  await expect(button(page, "Download image")).toBeHidden();
});

test("a shared ride's sections open but store nothing on the device", async ({ page }) => {
  await openRide(page);
  await section(page, "Share").click();
  await button(page, "Share a link").click();
  const link = await page.getByRole("textbox", { name: "Link to your ride" }).inputValue();
  await clearStorage(page);
  await page.goto(link);
  await section(page, "Share").click();
  await section(page, "Ride options").click();
  await button(page, "Make it yours").click();
  await expect(button(page, "Download image")).toBeVisible();
  await expect(button(page, "Ride together with my ride")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
});

test.describe("in Turkish", () => {
  test.use({ locale: "tr-TR" });

  test("the sections are named in Turkish", async ({ page }) => {
    await page.goto("/sample");
    for (const name of ["Düzenle", "Yolculuk seçenekleri", "Paylaş", "Trenin hakkında daha fazlası"]) {
      await expect(section(page, name)).toBeVisible();
    }
    await expect(button(page, "Kendine göre ayarla")).toBeVisible();
  });
});
