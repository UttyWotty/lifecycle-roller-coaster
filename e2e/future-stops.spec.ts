/**
 * Browser tests for future stops.
 * They confirm a stop added for next year appears after a "Today" line, softer, and announced as still to come.
 * They also confirm Ride it ends at today and lists what is coming, and the future stop survives a reload.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

async function addFutureStop(page: Page, title: string): Promise<void> {
  await button(page, "Add a future stop").click();
  const card = page.locator("ol > li").last();
  await expect(card.getByLabel("Date")).toHaveValue(String(new Date().getFullYear() + 1));
  await card.getByLabel("Title").fill(title);
  await button(page, "See my ride").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
}

test("a future stop sits after today and is announced as still to come", async ({ page }) => {
  await openRide(page);
  await expect(page.getByTestId("future-veil")).toHaveCount(0);
  await addFutureStop(page, "Move to Lisbon");
  await expect(page.getByTestId("future-veil")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Move to Lisbon, \d{4}, still to come/ })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("future-veil")).toHaveCount(1);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("Ride it ends at today and lists what is coming", async ({ page }) => {
    await openRide(page);
    const stopsBefore = await page.locator('svg[role="group"] g[role="button"]').count();
    await addFutureStop(page, "Open my own studio");
    await button(page, "Ride it").click();
    const panel = page.getByRole("region", { name: "Ride it" });
    await expect(panel.getByText(new RegExp(`^Stop 1 of ${stopsBefore}`))).toBeVisible();
    for (let stop = 0; stop <= stopsBefore; stop += 1) {
      await page.keyboard.press("ArrowRight");
    }
    await expect(panel.getByText("Still to come, after today:")).toBeVisible();
    await expect(panel.getByText(/Open my own studio \(\d{4}\)/)).toBeVisible();
  });
});
