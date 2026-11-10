/**
 * Browser tests for showing a ride on another website.
 * They confirm Copy embed code gives a snippet whose frame shows the ride on a page from another origin, and Ride it works there.
 * They also confirm only the embed page may be framed, a broken embed shows a message, and the embed saves nothing.
 */
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

/**
 * Serves a page on another port of this machine, standing in for someone's blog on another origin.
 * A real local server is needed: Chrome blocks pages it cannot place on this machine from framing localhost.
 */
async function serveBlog(html: string): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(html);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}/`, close: () => new Promise((resolve) => server.close(() => resolve())) };
}

async function copyEmbedCode(page: Page): Promise<string> {
  await openRide(page);
  await button(page, "Share a link").click();
  await button(page, "Copy embed code").click();
  await expect(page.getByText("Embed code copied.")).toBeVisible();
  return page.evaluate(() => navigator.clipboard.readText());
}

test("the embed code shows the ride inside another site's page", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const code = await copyEmbedCode(page);
  expect(code).toMatch(/^<iframe src="http:\/\/localhost:\d+\/embed#r=[^"]+" title="[^"]+"/);
  await page.evaluate(() => window.localStorage.clear());
  const blog = await serveBlog(`<!doctype html><title>Blog</title><h1>My blog</h1>${code}`);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(blog.url);
  const frame = page.frameLocator("iframe");
  await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
  await frame.getByRole("button", { name: "Ride it" }).click();
  await expect(frame.getByRole("region", { name: "Ride it" })).toBeVisible();
  await expect(frame.getByRole("link", { name: "Make your own ride" })).toHaveAttribute("target", "_blank");
  expect(requests.filter((url) => url.includes("/api/"))).toEqual([]);
  const embedStorage = await page.frames()[1].evaluate(() => window.localStorage.length);
  expect(embedStorage).toBe(0);
  await blog.close();
});

test("only the embed page may be framed", async ({ request }) => {
  const embed = await request.get("/embed");
  expect(embed.headers()["content-security-policy"]).toContain("frame-ancestors *");
  expect(embed.headers()["x-frame-options"]).toBeUndefined();
  for (const path of ["/", "/ride", "/story", "/embedded"]) {
    const response = await request.get(path);
    expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
  }
});

test("a broken embed shows a message and never throws", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const fragment of ["", "#r=", "#r=%%%", "#r=bm90IGEgcmlkZQ"]) {
    await page.goto(`/embed${fragment}`);
    await expect(page.getByText("This ride could not be shown.")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
