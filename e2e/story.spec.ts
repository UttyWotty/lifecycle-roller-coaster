/**
 * Browser tests for the landing page and the writing stage.
 * They cover the path into the app, prompts, the length limit and manual entry.
 * They also confirm the privacy promises: nothing is sent early, stored or kept after a reload.
 */
import { expect, test, type Page } from "@playwright/test";
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
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
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

test("Generate goes straight to the ride, with editing as an option", async ({ page }) => {
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.getByRole("heading", { name: "Your ride" })).toBeVisible();
  await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
  await expect(page.getByLabel("Title")).toHaveCount(0);
  await expect(page.getByText("sample events, not your story")).toBeVisible();
  await button(page, "Edit my events").click();
  await expect(page.getByRole("heading", { name: "Review your events" })).toBeVisible();
  await expect(page.getByText("This step is optional")).toBeVisible();
});

test("a story with no events opens the editor with guidance", async ({ page }) => {
  await page.route("**/api/extract", (route) =>
    route.fulfill({ json: { events: [], clarifications: [] } }),
  );
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.getByText("No events yet")).toBeVisible();
  await expect(button(page, "See my ride")).toBeDisabled();
});

test("returning from a blank event goes to the editor, not a broken ride", async ({ page }) => {
  await openReview(page);
  await button(page, "Add an event").click();
  await button(page, "Back to my story").click();
  await button(page, "Return to my ride").click();
  await expect(page.getByRole("heading", { name: "Review your events" })).toBeVisible();
});

test("returning to the story keeps the events", async ({ page }) => {
  await openReview(page);
  await page.locator("ol > li").first().getByLabel("Title").fill("Changed title");
  await button(page, "Back to my story").click();
  await expect(storyBox(page)).toHaveValue(STORY);
  await expect(page.getByText("replaces your current events")).toBeVisible();
  await storyBox(page).fill(`${STORY} more`);
  await button(page, "Return to my ride").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await expect(page.locator('svg g[role="button"]').first()).toContainText("Changed title");
});

test("the landing page shows every theme, leading to a sample", async ({ page }) => {
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "Themes" });
  await expect(gallery.getByRole("link")).toHaveCount(10);
  expect(await hasPageOverflow(page)).toBe(false);
  await gallery.getByRole("link", { name: "Nightmare Mode" }).click();
  await expect(page.getByRole("heading", { name: "Your ride" })).toBeVisible();
});

test.describe("sample lives", () => {
  const rideHeading = (page: Page) => page.getByRole("heading", { name: "Your ride" });
  const notice = (page: Page) => page.getByText("This is a sample life");

  test("the landing page opens a full ride in one click, with no AI call", async ({ page }) => {
    const extractions: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/extract")) {
        extractions.push(request.url());
      }
    });
    await page.goto("/");
    await page.getByRole("link", { name: "Try a sample life" }).click();
    await expect(rideHeading(page)).toBeVisible();
    await expect(notice(page)).toBeVisible();
    await expect(page.locator('svg g[role="button"]')).toHaveCount(14);
    await expect(page.getByLabel("Name your ride")).not.toHaveValue("");
    expect(extractions).toEqual([]);
  });

  test("Show me another life always changes the ride", async ({ page }) => {
    await page.goto("/sample");
    const title = page.getByLabel("Name your ride");
    let previous = await title.inputValue();
    for (let click = 0; click < 12; click += 1) {
      await button(page, "Show me another life").click();
      await expect(title).not.toHaveValue(previous);
      previous = await title.inputValue();
    }
  });

  test("a selected stop does not carry over to the next life", async ({ page }) => {
    await page.goto("/sample");
    await page.locator('svg g[role="button"]').first().click();
    await expect(page.getByRole("region", { name: "Selected stop" })).toBeVisible();
    await button(page, "Show me another life").click();
    await expect(page.getByRole("region", { name: "Selected stop" })).toHaveCount(0);
  });

  test("the story page button fills an empty story box", async ({ page }) => {
    await page.goto("/story");
    await button(page, "Try a sample life").click();
    await expect(rideHeading(page)).toBeVisible();
    await button(page, "Back to my story").click();
    await expect(storyBox(page)).not.toHaveValue("");
  });

  test("a sample never overwrites what the user wrote", async ({ page }) => {
    await page.goto("/story");
    await storyBox(page).fill(STORY);
    await button(page, "Try a sample life").click();
    await button(page, "Back to my story").click();
    await expect(storyBox(page)).toHaveValue(STORY);
  });

  test("the notice also shows while editing a sample's events", async ({ page }) => {
    await page.goto("/sample");
    await button(page, "Edit my events").click();
    await expect(page.getByRole("heading", { name: "Review your events" })).toBeVisible();
    await expect(notice(page)).toBeVisible();
  });

  test("a real ride cannot be replaced by a sample", async ({ page }) => {
    await page.goto("/story");
    await storyBox(page).fill(STORY);
    await button(page, "Generate my ride").click();
    await expect(rideHeading(page)).toBeVisible();
    await expect(button(page, "Show me another life")).toHaveCount(0);
    await button(page, "Back to my story").click();
    await expect(button(page, "Try a sample life")).toHaveCount(0);
  });

  test("generating after a sample clears its notice and title", async ({ page }) => {
    await page.goto("/sample");
    await button(page, "Back to my story").click();
    await button(page, "Generate my ride").click();
    await expect(rideHeading(page)).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
    await expect(page.getByLabel("Name your ride")).toHaveValue("");
  });

  test("every style still fits a sample on a phone", async ({ page }) => {
    await page.goto("/sample");
    await page.getByRole("radio", { name: /Metro map/ }).check();
    expect(await hasPageOverflow(page)).toBe(false);
  });
});
