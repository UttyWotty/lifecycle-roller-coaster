/**
 * Browser tests for how the story page handles extraction problems.
 * The endpoint is stubbed in the browser, because demo mode cannot produce these failures.
 * They confirm every failure shows a friendly message and never loses the user's story.
 */
import { expect, test } from "@playwright/test";
import { STORY, button, storyBox } from "./helpers";

const ENDPOINT = "**/api/extract";

for (const [code, status, message] of [
  ["refused", 422, "You did nothing wrong"],
  ["truncated", 422, "shorter version"],
  ["rate_limited", 503, "very busy"],
  ["not_configured", 503, "not set up"],
  ["provider_failed", 502, "Something went wrong"],
  ["payload_too_large", 413, "too long to send"],
] as const) {
  test(`${code} shows a friendly message and keeps the story`, async ({ page }) => {
    await page.route(ENDPOINT, (route) => route.fulfill({ status, json: { error: code } }));
    await page.goto("/story");
    await storyBox(page).fill(STORY);
    await button(page, "Generate my ride").click();
    await expect(page.getByRole("status").getByText(message)).toBeVisible();
    await expect(storyBox(page)).toHaveValue(STORY);
  });
}

test("a non-JSON error page is handled", async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.fulfill({ status: 502, contentType: "text/html", body: "<html>Bad gateway</html>" }),
  );
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.getByRole("status").getByText("Something went wrong")).toBeVisible();
});

test("a success response in the wrong shape is rejected", async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.fulfill({ json: { events: [{ junk: true }], clarifications: [] } }),
  );
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.getByRole("status").getByText("Something went wrong")).toBeVisible();
});

test("a network failure is handled", async ({ page }) => {
  await page.route(ENDPOINT, (route) => route.abort());
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.getByRole("status").getByText("could not reach the server")).toBeVisible();
  await expect(storyBox(page)).toHaveValue(STORY);
});

test("editing during a request cancels it", async ({ page }) => {
  let release: () => void = () => undefined;
  let requests = 0;
  await page.route(ENDPOINT, async (route) => {
    requests += 1;
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.abort();
  });
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(button(page, "Reading your story...")).toBeDisabled();
  await storyBox(page).fill(`${STORY} edited`);
  await expect(button(page, "Generate my ride")).toBeEnabled();
  expect(requests).toBe(1);
  release();
  await expect(page.getByRole("status").getByText("could not reach")).toHaveCount(0);
});

test("text from the model cannot run as HTML", async ({ page }) => {
  const title = "<img src=x onerror=window.__injected=1>";
  await page.route(ENDPOINT, (route) =>
    route.fulfill({
      json: {
        events: [
          {
            id: "event_001",
            date: "2015",
            title,
            description: "<script>window.__injected=1</script>",
            category: "other",
            sentiment: "neutral",
            impact: 5,
            confidence: 1,
          },
        ],
        clarifications: ["<b>Question?</b>"],
      },
    }),
  );
  await page.goto("/story");
  await storyBox(page).fill(STORY);
  await button(page, "Generate my ride").click();
  await expect(page.locator("ol > li").first().getByLabel("Title")).toHaveValue(title);
  await expect(page.getByText("<b>Question?</b>")).toBeVisible();
  expect(await page.evaluate(() => "__injected" in window)).toBe(false);
});
