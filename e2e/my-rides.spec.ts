/**
 * Browser tests for My rides, the rides saved on this device.
 * They confirm an older single save moves onto the shelf, a new ride is saved beside the first, and Open switches rides.
 * They also confirm Delete asks first, deleting the open ride starts a new one, and a reload reopens the last ride.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide, SHELF_KEY, storyBox } from "./helpers";

const OLD_KEY = "lifecycle-roller-coaster:ride";

function myRides(page: Page) {
  return page.getByRole("region", { name: "My rides" });
}

async function nameRide(page: Page, name: string): Promise<void> {
  await page.getByLabel("Name your ride").fill(name);
}

async function makeSecondRide(page: Page): Promise<void> {
  await openRide(page);
  await nameRide(page, "My life");
  await myRides(page).getByRole("button", { name: "New ride" }).click();
  await expect(storyBox(page)).toHaveValue("");
  await storyBox(page).fill("I moved to Lisbon in 2019.");
  await button(page, "Generate my ride").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await nameRide(page, "My career");
}

test("an older single save moves onto the shelf", async ({ page }) => {
  await openRide(page);
  await nameRide(page, "Kept from before");
  const ride = await page.evaluate((key) => {
    const shelf = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    return JSON.stringify(shelf.rides[0].ride);
  }, SHELF_KEY);
  await page.evaluate(([oldKey, text]) => {
    window.localStorage.clear();
    window.localStorage.setItem(oldKey, text);
  }, [OLD_KEY, ride]);
  await page.reload();
  await expect(page.getByLabel("Name your ride")).toHaveValue("Kept from before");
  await expect(myRides(page).getByText("Kept from before")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), OLD_KEY)).toBeNull();
});

test("a new ride is saved beside the first, and Open switches between them", async ({ page }) => {
  await makeSecondRide(page);
  await expect(myRides(page).getByRole("listitem")).toHaveCount(2);
  await myRides(page).getByRole("button", { name: "Open My life" }).click();
  await expect(page.getByLabel("Name your ride")).toHaveValue("My life");
  await page.reload();
  await expect(page.getByLabel("Name your ride")).toHaveValue("My life");
  await myRides(page).getByRole("button", { name: "Open My career" }).click();
  await expect(page.getByLabel("Name your ride")).toHaveValue("My career");
});

test("Delete asks first, and deleting the open ride starts a new one", async ({ page }) => {
  await makeSecondRide(page);
  await myRides(page).getByRole("button", { name: "Delete My life" }).click();
  await button(page, "Keep it").click();
  await expect(myRides(page).getByRole("listitem")).toHaveCount(2);
  await myRides(page).getByRole("button", { name: "Delete My life" }).click();
  await myRides(page).getByRole("button", { name: "Yes, delete My life" }).click();
  await expect(myRides(page).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByLabel("Name your ride")).toHaveValue("My career");
  await myRides(page).getByRole("button", { name: "Delete My career" }).click();
  await myRides(page).getByRole("button", { name: "Yes, delete My career" }).click();
  await expect(storyBox(page)).toHaveValue("");
  await expect(myRides(page)).toHaveCount(0);
});

test("a sample opened from the sample page never replaces a saved ride", async ({ page }) => {
  await openRide(page);
  await nameRide(page, "My life");
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await expect(myRides(page).getByRole("listitem")).toHaveCount(1);
  await myRides(page).getByRole("button", { name: "Open My life" }).click();
  await expect(page.getByLabel("Name your ride")).toHaveValue("My life");
});
