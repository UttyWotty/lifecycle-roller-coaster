/**
 * Browser tests for the landing page and the writing stage.
 * They cover the path into the app, prompts, the length limit and manual entry.
 * They also confirm the privacy promises: nothing is sent early, stored or kept after a reload.
 */
import { expect, test } from "@playwright/test";
import { SECRET, STORY, button, hasPageOverflow, openReview, storyBox } from "./helpers";

test("landing page leads to the story editor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lifecycle Roller Coaster" })).toBeVisible();
  const exampleRide = page.getByRole("img", { name: /example roller-coaster track/ });
  await expect(exampleRide).toBeVisible();
  await expect(exampleRide.getByTestId("ride-path")).toHaveCount(1);
  await expect(exampleRide.getByText("Started university")).toBeVisible();
  await expect(page.locator('svg g[role="button"]')).toHaveCount(0);
  expect(await hasPageOverflow(page)).toBe(false);
  await page.getByRole("link", { name: "Start your ride" }).click();
  await expect(page).toHaveURL(/\/story$/);
});

test("Generate needs a story within the limit", async ({ page }) => {
  await page.goto("/story");
  const generate = button(page, "Generate my ride");
  await expect(generate).toBeDisabled();
  await storyBox(page).fill("   \n ");
  await expect(generate).toBeDisabled();
  await storyBox(page).fill("a".repeat(20_000));
  await expect(generate).toBeEnabled();
  await storyBox(page).fill("a".repeat(20_001));
  await expect(generate).toBeDisabled();
  await expect(page.getByText("over the limit")).toBeVisible();
  await expect(storyBox(page)).toHaveValue("a".repeat(20_001));
});

test("a prompt adds to the story without losing text", async ({ page }) => {
  await page.goto("/story");
  await storyBox(page).fill("I was born in 1990.");
  await button(page, "My first job was...").click();
  await expect(storyBox(page)).toHaveValue("I was born in 1990.\nMy first job was ");
});

test("the story is sent only on Generate and is never stored", async ({ page }) => {
  const posts: (string | null)[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/extract")) {
      posts.push(request.postData());
    }
  });
  await page.goto("/story");
  await expect(page.getByText("sent to Anthropic's Claude API")).toBeVisible();
  await storyBox(page).fill(STORY);
  expect(posts).toHaveLength(0);
  await button(page, "Generate my ride").click();
  await page.getByRole("heading", { name: "Review your events" }).waitFor();
  expect(posts).toEqual([JSON.stringify({ story: STORY })]);
  const stored = await page.evaluate(() =>
    JSON.stringify([{ ...localStorage }, { ...sessionStorage }, document.cookie]),
  );
  expect(stored).not.toContain(SECRET);
  await page.reload();
  await expect(storyBox(page)).toHaveValue("");
});

test("adding events by hand sends nothing", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => {
    requests += request.url().includes("/api/extract") ? 1 : 0;
  });
  await page.goto("/story");
  await button(page, "Skip AI and add events myself").click();
  await expect(page.getByRole("heading", { name: "Review your events" })).toBeVisible();
  await expect(page.locator("ol > li")).toHaveCount(1);
  expect(requests).toBe(0);
});

test("returning to the story keeps the events", async ({ page }) => {
  await openReview(page);
  await page.locator("ol > li").first().getByLabel("Title").fill("Changed title");
  await button(page, "Back to my story").click();
  await expect(storyBox(page)).toHaveValue(STORY);
  await expect(page.getByText("replaces your current events")).toBeVisible();
  await storyBox(page).fill(`${STORY} more`);
  await button(page, "Return to my events").click();
  await expect(page.locator("ol > li").first().getByLabel("Title")).toHaveValue("Changed title");
});
