/**
 * Browser tests for the event review stage.
 * They cover editing, validation, ordering, undo and how best guesses are settled.
 * They also confirm accessible names and that long text fits a phone screen.
 */
import { expect, test } from "@playwright/test";
import { button, eventCard, hasPageOverflow, openReview } from "./helpers";

const BEST_GUESS = "Best guess";

test("review opens with an editable card per event", async ({ page }) => {
  await openReview(page);
  await expect(page.locator("ol > li")).toHaveCount(4);
  await expect(page.getByText("Demo data")).toBeVisible();
  await expect(eventCard(page, 1).getByLabel("Title")).toHaveValue("Started university");
  await expect(eventCard(page, 4).getByLabel("Date")).toHaveValue("");
  await expect(page.locator("h1")).toBeFocused();
});

test("a best guess clears on a sentiment change but not on a title change", async ({ page }) => {
  await openReview(page);
  const card = eventCard(page, 3);
  await expect(card.getByText(BEST_GUESS)).toBeVisible();
  await card.getByLabel("Title").fill("Our wedding");
  await expect(card.getByText(BEST_GUESS)).toBeVisible();
  await card.getByLabel("How it felt").selectOption("negative");
  await expect(card.getByText(BEST_GUESS)).toHaveCount(0);
  await expect(card.locator("input[type=range]")).toHaveValue("9");
});

test("Looks right settles a best guess", async ({ page }) => {
  await openReview(page);
  await page.getByRole("button", { name: "Looks right for event 4" }).click();
  await expect(eventCard(page, 4).getByText(BEST_GUESS)).toHaveCount(0);
});

test("impact works from the keyboard and leaves sentiment alone", async ({ page }) => {
  await openReview(page);
  const card = eventCard(page, 4);
  await card.locator("input[type=range]").focus();
  await page.keyboard.press("ArrowRight");
  await expect(card.getByText("Impact: 7 of 10")).toBeVisible();
  await expect(card.getByLabel("How it felt")).toHaveValue("positive");
  await expect(card.getByText(BEST_GUESS)).toHaveCount(0);
});

test("invalid fields show errors and block the ride", async ({ page }) => {
  await openReview(page);
  await button(page, "Add an event").click();
  const card = eventCard(page, 5);
  await expect(card.getByText("Add a title")).toBeVisible();
  await expect(button(page, "See my ride")).toBeDisabled();
  await card.getByLabel("Title").fill("New job");
  await expect(button(page, "See my ride")).toBeEnabled();
  await card.getByLabel("Date").fill("2015-02-31");
  await expect(card.getByText("Use a real date")).toBeVisible();
  await expect(card.getByLabel("Date")).toHaveAttribute("aria-invalid", "true");
  await card.getByLabel("Date").fill("");
  await expect(card.getByText("Use a real date")).toHaveCount(0);
});

test("events can be reordered and sorted by date", async ({ page }) => {
  await openReview(page);
  await expect(page.getByRole("button", { name: "Move event 1 up" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move event 4 down" })).toBeDisabled();
  await page.getByRole("button", { name: "Move event 2 up" }).click();
  await expect(eventCard(page, 1).getByLabel("Title")).toHaveValue("Lost job during the pandemic");
  await button(page, "Sort by date").click();
  await expect(eventCard(page, 1).getByLabel("Title")).toHaveValue("Started university");
  await expect(eventCard(page, 4).getByLabel("Title")).toHaveValue("Ran a first marathon");
});

test("undo restores an event and keeps later edits", async ({ page }) => {
  await openReview(page);
  await page.getByRole("button", { name: "Delete event 1" }).click();
  await expect(page.locator("ol > li")).toHaveCount(3);
  await expect(page.getByText("Removed Started university.")).toBeVisible();
  await eventCard(page, 1).getByLabel("Title").fill("Edited after delete");
  await button(page, "Undo").click();
  await expect(eventCard(page, 1).getByLabel("Title")).toHaveValue("Started university");
  await expect(eventCard(page, 2).getByLabel("Title")).toHaveValue("Edited after delete");
});

test("undo after adding an event keeps both events separate", async ({ page }) => {
  await openReview(page);
  await page.getByRole("button", { name: "Delete event 4" }).click();
  await button(page, "Add an event").click();
  await eventCard(page, 4).getByLabel("Title").fill("Replacement");
  await button(page, "Undo").click();
  await expect(page.locator("ol > li")).toHaveCount(5);
  await eventCard(page, 5).getByLabel("Title").fill("Still separate");
  await expect(eventCard(page, 4).getByLabel("Title")).toHaveValue("Ran a first marathon");
});

test("every control has an accessible name", async ({ page }) => {
  await openReview(page);
  const unnamed = await page
    .locator("input, select, textarea")
    .evaluateAll((controls) =>
      controls.filter((control) => !(control as HTMLInputElement).labels?.length).length,
    );
  expect(unnamed).toBe(0);
  const names = await page
    .locator("button")
    .evaluateAll((buttons) =>
      buttons.map((item) => item.getAttribute("aria-label") ?? item.textContent),
    );
  expect(new Set(names).size).toBe(names.length);
});

test("long text fits a phone screen", async ({ page }) => {
  await openReview(page);
  await eventCard(page, 1).getByLabel("Title").fill("W".repeat(300));
  await eventCard(page, 1).getByLabel("Description").fill("D".repeat(600));
  await page.getByRole("button", { name: "Delete event 2" }).click();
  expect(await hasPageOverflow(page)).toBe(false);
});

test("generating again replaces edited events", async ({ page }) => {
  await openReview(page);
  await eventCard(page, 1).getByLabel("Title").fill("Changed");
  await button(page, "Back to my story").click();
  await button(page, "Generate my ride").click();
  await page.getByRole("heading", { name: "Review your events" }).waitFor();
  await expect(eventCard(page, 1).getByLabel("Title")).toHaveValue("Started university");
});
