/**
 * Browser tests for the ride saved on the visitor's device.
 * They confirm a reload brings the ride and its look back, that the story text is never stored, and that samples are not saved.
 * They also confirm Start over deletes the saved ride, and that broken or blocked storage is ignored.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide, SECRET, storyBox } from "./helpers";

const STORAGE_KEY = "lifecycle-roller-coaster:ride";

async function storedRide(page: Page): Promise<string | null> {
  return page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
}

test("a reload brings back the ride and its look", async ({ page }) => {
  await openRide(page);
  await page.getByRole("radio", { name: /Loop-the-loops/ }).check();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your ride" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Loop-the-loops/ })).toBeChecked();
  await expect(page.getByText(/saved on this device only/)).toBeVisible();
});

test("the story text is never stored", async ({ page }) => {
  await openRide(page);
  const stored = await storedRide(page);
  expect(stored).not.toBeNull();
  expect(stored).not.toContain(SECRET);
  const everything = await page.evaluate(() => JSON.stringify({ ...window.localStorage }));
  expect(everything).not.toContain(SECRET);
});

test("start over asks first, then deletes the saved ride", async ({ page }) => {
  await openRide(page);
  await button(page, "Start over").click();
  await button(page, "Keep my ride").click();
  expect(await storedRide(page)).not.toBeNull();
  await button(page, "Start over").click();
  await button(page, "Yes, start over").click();
  await expect(storyBox(page)).toHaveValue("");
  expect(await storedRide(page)).toBeNull();
  await page.reload();
  await expect(storyBox(page)).toBeVisible();
});

test("a sample life is never saved", async ({ page }) => {
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  expect(await storedRide(page)).toBeNull();
});

test("a broken save is ignored", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "{broken"), STORAGE_KEY);
  await page.goto("/story");
  await expect(storyBox(page)).toBeVisible();
});

test("blocked storage does not stop the app", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await openRide(page);
  await expect(page.getByRole("heading", { name: "Your ride" })).toBeVisible();
});

test("editing events, title and theme survives a reload, and an invalid edit keeps the last good save", async ({ page }) => {
  await openRide(page);
  await page.getByLabel("Name your ride").fill("Kept title");
  await button(page, "Edit my events").click();
  await page.getByRole("heading", { name: "Review your events" }).waitFor();
  await page.locator("ol > li").first().getByLabel("Title").fill("Edited title");
  const good = await storedRide(page);
  expect(good).toContain("Edited title");
  await page.locator("ol > li").first().getByLabel("Title").fill("");
  expect(await storedRide(page)).toBe(good);
  await page.locator("ol > li").first().getByLabel("Title").fill("Edited again");
  await page.reload();
  await expect(page.getByLabel("Name your ride")).toHaveValue("Kept title");
  expect(await storedRide(page)).toContain("Edited again");
});

test("viewing a sample does not overwrite a saved own ride, and no story text is stored", async ({ page }) => {
  await openRide(page);
  const before = await storedRide(page);
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  expect(await storedRide(page)).toBe(before);
  await page.goto("/story");
  await expect(page.getByRole("heading", { name: "Your ride" })).toBeVisible();
  await button(page, "Back to my story").click();
  await expect(storyBox(page)).toHaveValue("");
  await expect(button(page, "Try a sample life")).toHaveCount(0);
});

test("tampered saves are ignored and the story page still works", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/story");
  await storyBox(page).waitFor();
  const tampered = [
    "null",
    "[]",
    '{"version":1}',
    '{"version":0,"events":[]}',
    '{"version":1,"events":[],"chapters":[],"report":null,"clarifications":[],"isDemo":false,"title":"","style":"x","theme":"y","rider":"z","fitToScreen":false}',
  ];
  for (const text of tampered) {
    await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [STORAGE_KEY, text]);
    await page.reload();
    await expect(storyBox(page)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("no console errors on a restored ride or a sample, and notices survive a reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await openRide(page);
  await page.reload();
  await expect(page.getByText("sample events, not your story")).toBeVisible();
  await expect(button(page, "Show me another life")).toHaveCount(0);
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  expect(errors).toEqual([]);
});
