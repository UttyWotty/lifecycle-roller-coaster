/**
 * Browser tests for the feedback page against the real route, which keeps messages in memory off Vercel.
 * They confirm a message is sent with only the reaction, words and language, and that the visitor is thanked.
 * They also confirm the friendly errors, the hourly limit, the Turkish page, and where the feedback link appears.
 */
import { expect, test, type Page } from "@playwright/test";
import { button } from "./helpers";

const MESSAGE = "Loved the Nightmare world. Could there be a garden one?";
let nextAddress = 1;

/** Each test sends as its own visitor, so the per-visitor limit of one test never affects another. */
async function asNewVisitor(page: Page): Promise<void> {
  nextAddress += 1;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${nextAddress}-${test.info().workerIndex}` });
}

async function send(page: Page, reaction: string, message: string): Promise<void> {
  await page.getByRole("radio", { name: reaction }).check();
  await page.getByLabel("Anything else? (optional)").fill(message);
  await button(page, "Send").click();
}

test("a visitor sends a reaction and a message, and only those are sent", async ({ page }) => {
  await asNewVisitor(page);
  await page.goto("/feedback");
  const posted = page.waitForRequest((request) => request.url().endsWith("/api/feedback"));
  await send(page, "Loved it", MESSAGE);
  expect(JSON.parse((await posted).postData() ?? "{}")).toEqual({ reaction: "loved", message: MESSAGE, locale: "en" });
  await expect(page.getByText("Thank you! Your message is in.")).toBeVisible();
  await button(page, "Send another").click();
  await expect(page.getByLabel("Anything else? (optional)")).toHaveValue("");
});

test("a reaction alone is enough, and choosing one is required", async ({ page }) => {
  await asNewVisitor(page);
  await page.goto("/feedback");
  await button(page, "Send").click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Please choose how it was first.");
  await page.getByRole("radio", { name: "It was fine" }).check();
  await button(page, "Send").click();
  await expect(page.getByText("Thank you! Your message is in.")).toBeVisible();
});

test("the fourth message in an hour is refused politely", async ({ page }) => {
  await asNewVisitor(page);
  await page.goto("/feedback");
  for (let sent = 0; sent < 3; sent += 1) {
    await send(page, "It was fine", `Message ${sent}`);
    await button(page, "Send another").click();
  }
  await send(page, "It was fine", "One too many");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Thanks, that is plenty for now. Please try again later.");
  await expect(page.getByLabel("Anything else? (optional)")).toHaveValue("One too many");
});

test("a store or network failure keeps the words in the box", async ({ page }) => {
  await page.route("**/api/feedback", (route) => route.fulfill({ status: 503, json: { error: "unavailable" } }));
  await page.goto("/feedback");
  await send(page, "Something was confusing", MESSAGE);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Messages cannot be taken right now.");
  await expect(page.getByLabel("Anything else? (optional)")).toHaveValue(MESSAGE);
  await page.unroute("**/api/feedback");
  await page.route("**/api/feedback", (route) => route.abort());
  await button(page, "Send").click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("The site could not be reached.");
  await expect(page.getByLabel("Anything else? (optional)")).toHaveValue(MESSAGE);
});

test("the route refuses bad input and oversized bodies", async ({ request }) => {
  const headers = { "content-type": "application/json", "x-forwarded-for": "198.51.100.7" };
  const unknown = await request.post("/api/feedback", { headers, data: { reaction: "angry", message: "", locale: "en" } });
  expect(unknown.status()).toBe(400);
  const extra = await request.post("/api/feedback", { headers, data: { reaction: "fine", message: "", locale: "en", story: "x" } });
  expect(extra.status()).toBe(400);
  const huge = await request.post("/api/feedback", { headers, data: { reaction: "fine", message: "x".repeat(5000), locale: "en" } });
  expect(huge.status()).toBe(413);
});

test("the footer links to feedback, and the ride screen invites it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Send feedback" })).toBeVisible();
  await page.goto("/sample");
  await page.getByRole("link", { name: "How was your ride? Tell us" }).click();
  await expect(page.getByRole("heading", { name: "Tell us what you think" })).toBeVisible();
});

test.describe("in Turkish", () => {
  test.use({ locale: "tr-TR" });

  test("the feedback page speaks Turkish and sends the language", async ({ page }) => {
    await asNewVisitor(page);
    await page.goto("/feedback");
    await expect(page.getByRole("heading", { name: "Ne düşündüğünü anlat" })).toBeVisible();
    const posted = page.waitForRequest((request) => request.url().endsWith("/api/feedback"));
    await page.getByRole("radio", { name: "Bayıldım" }).check();
    await button(page, "Gönder").click();
    expect(JSON.parse((await posted).postData() ?? "{}")).toMatchObject({ reaction: "loved", locale: "tr" });
    await expect(page.getByText("Teşekkürler! Mesajın ulaştı.")).toBeVisible();
  });
});
