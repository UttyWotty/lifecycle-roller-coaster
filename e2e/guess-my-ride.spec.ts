/**
 * Browser tests for Guess my ride on a shared ride.
 * They confirm the curtain hides the stop being guessed, answers come only after both guesses, and a full game scores.
 * They also confirm statistics stay hidden while playing, the score is shared with the ride's link, a metro map is
 * played as a coaster, and keyboard focus follows the game.
 */
import { expect, test, type Browser, type Page } from "@playwright/test";
import { button, openFoldOuts } from "./helpers";

async function sampleLink(browser: Browser): Promise<string> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/sample");
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await button(page, "Share a link").click();
  return page.getByRole("textbox", { name: "Link to your ride" }).inputValue();
}

function panel(page: Page) {
  return page.getByRole("region", { name: "Guess my ride" });
}

test("a full game hides each stop until it is guessed, then scores and shares", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await page.goto(link);
  await openFoldOuts(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const copied: string[] = [];
    (window as Window & { copied?: string[] }).copied = copied;
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => void copied.push(text) }, configurable: true });
  });
  await button(page, "Guess my ride").click();
  await expect(page.getByTestId("guess-curtain")).toBeVisible();
  await expect(page.getByRole("region", { name: "Life statistics" })).toHaveCount(0);
  await expect(page.locator('svg[role="group"] g[role="button"]')).toHaveCount(0);
  const total = Number((await panel(page).getByText(/^Stop 1 of (\d+)/).innerText()).match(/of (\d+)/)?.[1]);
  for (let stop = 1; stop <= total; stop += 1) {
    await expect(panel(page).getByText(new RegExp(`^Stop ${stop} of ${total}`))).toBeVisible();
    await expect(button(page, "Reveal")).toBeDisabled();
    await button(page, "Good").click();
    await expect(button(page, "Reveal")).toBeDisabled();
    await button(page, "Big (7 to 10)").click();
    await button(page, "Reveal").click();
    await expect(panel(page).getByText(/^It felt /)).toBeVisible();
    if (stop < total) {
      await button(page, "Next stop").click();
    }
  }
  await expect(page.getByTestId("guess-curtain")).toHaveCount(0);
  await expect(panel(page).getByText(new RegExp(`/ ${total * 2}$`))).toBeVisible();
  await button(page, "Share my score").click();
  await expect(page.getByText("Score copied")).toBeVisible();
  const copied = await page.evaluate(() => (window as Window & { copied?: string[] }).copied ?? []);
  expect(copied[0]).toMatch(/^I scored \d+\/\d+ guessing .*Can you beat me\? .*\/ride#r=/);
  await button(page, "Done").click();
  await expect(page.getByRole("region", { name: "Life statistics" })).toBeVisible();
});

test("a metro map is played as a coaster and comes back after the game", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await page.goto(link);
  await openFoldOuts(page);
  await page.getByRole("radio", { name: "Metro map" }).check();
  await button(page, "Guess my ride").click();
  await expect(page.getByRole("radio", { name: "Metro map" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Coaster" })).toBeChecked();
  await expect(button(page, "Good")).toBeVisible();
  await button(page, "Stop guessing").click();
  await expect(page.getByRole("radio", { name: "Metro map" })).toBeChecked();
});

test("keyboard players keep their place through a reveal", async ({ page, browser }) => {
  const link = await sampleLink(browser);
  await page.goto(link);
  await openFoldOuts(page);
  await button(page, "Guess my ride").click();
  await button(page, "Hard").click();
  await button(page, "Small (1 to 3)").click();
  await button(page, "Reveal").click();
  await expect(button(page, "Next stop")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(panel(page).getByRole("heading")).toBeFocused();
});
