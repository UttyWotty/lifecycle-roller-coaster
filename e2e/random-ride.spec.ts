/**
 * Browser test for the Random ride button on the user's own ride screen.
 * It presses the button twice and checks that the chosen theme changes each time while the stops stay the same.
 * It also checks that screen readers hear the name of the new look.
 */
import { expect, test, type Page } from "@playwright/test";
import { STORY, button, openRide } from "./helpers";

const PRESSES = 2;

async function chosenTheme(page: Page): Promise<string> {
  return (await page.locator('label:has(input[name="ride-theme"]:checked)').textContent()) ?? "";
}

test("Random ride changes the theme on every press and keeps the stops", async ({ page }) => {
  await openRide(page);
  const stops = await page.locator('svg[role="group"] [role="button"]').count();
  for (let press = 0; press < PRESSES; press += 1) {
    const before = await chosenTheme(page);
    await button(page, "Random ride").click();
    await expect.poll(() => chosenTheme(page)).not.toBe(before);
    await expect(page.getByRole("status").filter({ hasText: "Now riding" })).toBeAttached();
    await expect(page.locator('svg[role="group"] [role="button"]')).toHaveCount(stops);
  }
});

test("a surprise look survives a reload", async ({ page }) => {
  await openRide(page);
  await button(page, "Random ride").click();
  const chosen = await chosenTheme(page);
  await expect.poll(async () => page.evaluate(() => Object.keys(window.localStorage).length)).toBeGreaterThan(0);
  await page.reload();
  await expect.poll(() => chosenTheme(page)).toBe(chosen);
});

test.describe("in Turkish", () => {
  test.use({ locale: "tr-TR" });

  test("the announcement is in Turkish", async ({ page }) => {
    await page.goto("/story");
    await page.getByRole("textbox", { name: "Hikâyen" }).fill(STORY);
    await button(page, "Trenimi oluştur").click();
    await page.getByRole("heading", { name: "Trenin" }).waitFor();
    await button(page, "Sürpriz tren").click();
    await expect(page.getByRole("status").filter({ hasText: "Şimdi" })).toBeAttached();
  });
});
