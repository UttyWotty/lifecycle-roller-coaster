/**
 * Browser tests for the security headers on the production server.
 * They confirm pages and the API refuse framing and send a content security policy.
 * They also walk through a ride and its export to prove the policy blocks nothing the app needs.
 */
import { expect, test } from "@playwright/test";
import { button, openRide } from "./helpers";

const CSP_VIOLATION = /Content Security Policy|Refused to/i;

test("pages and the API send the security headers", async ({ request }) => {
  for (const path of ["/", "/story"]) {
    const headers = (await request.get(path)).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-powered-by"]).toBeUndefined();
  }
  const api = await request.post("/api/extract", { headers: { "Content-Type": "application/json" }, data: { story: "x" } });
  expect(api.headers()["content-security-policy"]).toContain("default-src 'self'");
});

test("the policy blocks nothing on the way to an exported image", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (CSP_VIOLATION.test(message.text())) {
      violations.push(message.text());
    }
  });
  await openRide(page);
  const download = page.waitForEvent("download");
  await button(page, "Download image").click();
  await download;
  expect(violations).toEqual([]);
});
