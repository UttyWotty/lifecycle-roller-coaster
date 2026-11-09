/**
 * Browser tests for ride lenses.
 * They confirm a lens redraws only its events with its own title, and that a title the user typed always wins.
 * They also confirm age lenses need a valid birth year, and that the lens survives a reload but not a new reading.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide, storyBox } from "./helpers";

function lens(page: Page, name: string) {
  return page.getByRole("radio", { name, exact: true });
}

function stops(page: Page) {
  return page.locator('svg[role="group"] g[role="button"]');
}

function drawing(page: Page) {
  return page.locator('svg[role="group"]');
}

test("a decade lens shows only its events, with its own title", async ({ page }) => {
  await openRide(page);
  const all = await stops(page).count();
  await lens(page, "2020s").check();
  await expect(stops(page)).toHaveCount(2);
  expect(all).toBeGreaterThan(2);
  await expect(drawing(page).getByText("My 2020s")).toBeVisible();
  await lens(page, "Whole life").check();
  await expect(stops(page)).toHaveCount(all);
});

test("a title the user typed wins over the lens title", async ({ page }) => {
  await openRide(page);
  await lens(page, "2020s").check();
  await page.getByRole("textbox", { name: "Name your ride" }).fill("Our wild years");
  await expect(drawing(page).getByText("Our wild years")).toBeVisible();
  await expect(drawing(page).getByText("My 2020s")).toHaveCount(0);
});

test("age lenses appear only for a valid birth year", async ({ page }) => {
  await openRide(page);
  const born = page.getByRole("textbox", { name: /Born in/ });
  await born.fill("abcd");
  await expect(lens(page, "My 20s")).toHaveCount(0);
  await born.fill("1995");
  await lens(page, "My 20s").check();
  await expect(stops(page)).toHaveCount(3);
  await expect(drawing(page).getByText("My 20s Roller Coaster")).toBeVisible();
});

test("the lens survives a reload but a new reading starts from the whole life", async ({ page }) => {
  await openRide(page);
  await lens(page, "2020s").check();
  await page.reload();
  await expect(lens(page, "2020s")).toBeChecked();
  await expect(stops(page)).toHaveCount(2);
  await button(page, "Back to my story").click();
  await storyBox(page).fill("Another story about 2021 and 2023.");
  await button(page, "Generate my ride").click();
  await expect(lens(page, "Whole life")).toBeChecked();
});

test("Ride it rides only the lens's stops", async ({ page }) => {
  await openRide(page);
  await lens(page, "2020s").check();
  await button(page, "Ride it").click();
  await button(page, "Next").click();
  await expect(page.getByRole("region", { name: "Ride it" }).getByText(/^Stop 1 of 2/)).toBeVisible();
});
