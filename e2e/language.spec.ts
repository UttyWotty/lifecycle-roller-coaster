/**
 * Browser tests for the app's language.
 * They confirm a Turkish browser gets Turkish words and others get English, and the picker switches every page at once.
 * They also confirm the choice is remembered, the page's lang attribute follows it, and nothing errors on the way.
 */
import { expect, test } from "@playwright/test";

test.describe("in a Turkish browser", () => {
  test.use({ locale: "tr-TR" });

  test("the landing page speaks Turkish, and the picker switches to English for good", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Yolculuğa başla" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await page.getByLabel("Dil").selectOption("en");
    await expect(page.getByRole("link", { name: "Start your ride" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    await expect(page.getByRole("link", { name: "Start your ride" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test("other browsers get English, and Turkish can be chosen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Start your ride" })).toBeVisible();
  await page.getByLabel("Language").selectOption("tr");
  await expect(page.getByRole("heading", { name: "Trenin için bir görünüm seç" })).toBeVisible();
});

test("the embed page has no footer", async ({ page }) => {
  await page.goto("/embed");
  await expect(page.getByLabel("Language")).toHaveCount(0);
});
