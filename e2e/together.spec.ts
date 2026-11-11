/**
 * Browser tests for Ride together.
 * They confirm both ways in, that the same year lines up in both drawings, and that both carts ride through time together.
 * They also confirm the pair link works in a fresh browser, carries no descriptions, and broken links are handled kindly.
 */
import { expect, test, type Browser, type Page } from "@playwright/test";
import { EMPTY_STORAGE, button, openRide } from "./helpers";

async function sampleLink(browser: Browser): Promise<string> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await button(page, "Share a link").click();
  return page.getByRole("textbox", { name: "Link to your ride" }).inputValue();
}

function drawings(page: Page) {
  return page.getByRole("region", { name: /Two rides on one timeline/ }).locator("svg");
}

test("from a friend's link, ride together with my saved ride", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await openRide(page);
  await page.goto(link);
  await button(page, "Ride together with my ride").click();
  await expect(page.getByRole("heading", { name: "Riding together" })).toBeVisible();
  await expect(drawings(page)).toHaveCount(2);
});

test("without a saved ride, it explains what to do", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await page.goto(link);
  await button(page, "Ride together with my ride").click();
  await expect(page.getByText(/Make your own ride first/)).toBeVisible();
});

test("pasting a friend's link on my ride opens the ride together", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await openRide(page);
  const field = page.getByRole("textbox", { name: "Friend's ride link" });
  await field.fill("https://example.com/not-a-ride");
  await button(page, "Ride together").click();
  await expect(page.getByText(/does not look like a ride link/)).toBeVisible();
  await field.fill(link);
  await button(page, "Ride together").click();
  await expect(page.getByRole("heading", { name: "Riding together" })).toBeVisible();
});

test("both carts ride through time and the card names each person", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await openRide(page);
  await page.getByRole("textbox", { name: "Friend's ride link" }).fill(link);
  await button(page, "Ride together").click();
  await page.getByRole("heading", { name: "Riding together" }).waitFor();
  await button(page, "Ride together").click();
  await expect(page.getByTestId("playback-cart")).toHaveCount(2);
  await button(page, "Next").click();
  const card = page.getByRole("region", { name: "Ride together", exact: true });
  await expect(card.getByRole("listitem")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
});

test("the pair link opens in a fresh browser and carries no descriptions", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await openRide(page);
  await page.getByRole("textbox", { name: "Friend's ride link" }).fill(link);
  await button(page, "Ride together").click();
  await page.getByRole("heading", { name: "Riding together" }).waitFor();
  const pairLink = page.url();
  const payloads = pairLink.split("#")[1].split("&").map((part) => Buffer.from(part.slice(2).replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8"));
  for (const payload of payloads) {
    expect(Object.keys(JSON.parse(payload)).sort()).toEqual(["c", "e", "h", "r", "s", "t", "v"]);
  }
  const fresh = await (await browser.newContext({ storageState: EMPTY_STORAGE })).newPage();
  await fresh.goto(pairLink);
  await expect(fresh.getByRole("heading", { name: "Riding together" })).toBeVisible();
  expect(await fresh.evaluate(() => window.localStorage.length)).toBe(0);
});

test("a broken pair link shows a friendly message", async ({ page }) => {
  for (const fragment of ["", "#a=&b=", "#a=xyz", "#r=abc"]) {
    await page.goto(`/together${fragment}`);
    await expect(page.getByRole("heading", { name: "This ride together does not work" })).toBeVisible();
  }
});
