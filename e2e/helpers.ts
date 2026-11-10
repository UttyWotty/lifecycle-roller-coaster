/**
 * Shared steps for the browser tests.
 * They move through the app the way a user does, using accessible names rather than styles.
 * Keeping them here means a change to the flow is fixed in one place.
 */
import type { Locator, Page } from "@playwright/test";

export const STORY = "I started university in 2015. ZZSECRETSTORYZZ";
export const SECRET = "ZZSECRETSTORYZZ";

export function storyBox(page: Page): Locator {
  return page.getByRole("textbox", { name: "Your story" });
}

export function button(page: Page, name: string): Locator {
  return page.getByRole("button", { name, exact: true });
}

export function eventCard(page: Page, position: number): Locator {
  return page.locator("ol > li").nth(position - 1);
}

export function rideStop(page: Page, title: string): Locator {
  return page.locator('svg g[role="button"]').filter({ hasText: title });
}

export async function openRide(page: Page): Promise<void> {
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
}

export async function openReview(page: Page): Promise<void> {
  await openRide(page);
  await button(page, "Edit my events").click();
  await page.getByRole("heading", { name: "Review your events" }).waitFor();
}

export async function hasPageOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

/** Where the app keeps its shelf of saved rides. */
export const SHELF_KEY = "lifecycle-roller-coaster:rides";

/** The open saved ride as text, or null when none is saved. */
export function storedRide(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    const shelf = JSON.parse(window.localStorage.getItem(key) ?? "null") as { activeId: string; rides: { id: string; ride: unknown }[] } | null;
    const entry = shelf?.rides.find(({ id }) => id === shelf.activeId);
    return entry ? JSON.stringify(entry.ride) : null;
  }, SHELF_KEY);
}
