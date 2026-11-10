/**
 * Browser tests for share links.
 * They confirm a shared link opens the same ride in a fresh browser, and that private fields never enter the link.
 * They also confirm the social buttons carry the link, broken links are handled kindly, and nothing is saved.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide, SECRET, storedRide } from "./helpers";

async function shareLink(page: Page): Promise<string> {
  await button(page, "Share a link").click();
  return page.getByRole("textbox", { name: "Link to your ride" }).inputValue();
}

function stopTitles(page: Page): Promise<string[]> {
  return page.locator('svg[role="group"] g[role="button"]').evaluateAll((stops) =>
    stops.map((stop) => stop.getAttribute("aria-label") ?? ""),
  );
}

test("a shared link opens the same ride in a fresh browser", async ({ page, browser }) => {
  await openRide(page);
  await page.getByRole("radio", { name: /Loop-the-loops/ }).check();
  await page.getByRole("textbox", { name: "Name your ride" }).fill("Shared and sound");
  const titles = await stopTitles(page);
  const link = await shareLink(page);
  expect(link).toMatch(/\/ride#r=[A-Za-z0-9_-]+$/);

  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(fresh.getByRole("heading", { name: "Shared and sound" })).toBeVisible();
  await expect(fresh.getByRole("radio", { name: /Loop-the-loops/ })).toBeChecked();
  expect(await stopTitles(fresh)).toEqual(titles);
  expect(await fresh.evaluate(() => window.localStorage.length)).toBe(0);
});

test("the link carries no story, descriptions or report", async ({ page }) => {
  await openRide(page);
  const link = await shareLink(page);
  const payload = Buffer.from(link.split("#r=")[1].replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8");
  expect(payload).not.toContain(SECRET);
  const descriptions = await storedRide(page);
  for (const description of JSON.parse(descriptions ?? "{}").events.map((event: { description: string }) => event.description)) {
    if (description) {
      expect(payload).not.toContain(description);
    }
  }
});

test("social buttons carry the whole link", async ({ page }) => {
  await openRide(page);
  const link = await shareLink(page);
  for (const name of ["X", "WhatsApp", "Telegram", "Email"]) {
    const href = await page.getByRole("link", { name, exact: true }).getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain(link);
  }
});

test("copy link puts the link on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openRide(page);
  const link = await shareLink(page);
  await button(page, "Copy link").click();
  await expect(page.getByText("Link copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(link);
});

test("a lens shares only its events and title", async ({ page, browser }) => {
  await openRide(page);
  await page.getByRole("radio", { name: "2020s", exact: true }).check();
  const link = await shareLink(page);
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(fresh.getByRole("heading", { name: "My 2020s" })).toBeVisible();
  await expect(fresh.locator('svg[role="group"] g[role="button"]')).toHaveCount(2);
});

test("a broken link shows a friendly message", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const fragment of ["", "#r=", "#r=not-a-ride", "#something-else"]) {
    await page.goto(`/ride${fragment}`);
    await expect(page.getByRole("heading", { name: "This ride link does not work" })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Make my own ride" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("a shared ride can be ridden", async ({ page, browser }) => {
  await openRide(page);
  const link = await shareLink(page);
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await button(fresh, "Ride it").click();
  await button(fresh, "Next").click();
  await expect(fresh.getByRole("region", { name: "Ride it" }).getByText(/^Stop 1 of/)).toBeVisible();
});

test("pages carry a social preview picture", async ({ page }) => {
  await page.goto("/");
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toContain("/opengraph-image");
  const response = await page.request.get(new URL(image ?? "").pathname);
  expect(response.headers()["content-type"]).toContain("image/png");
});
