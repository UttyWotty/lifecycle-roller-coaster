/**
 * Browser tests for the ride stage and image export.
 * They confirm the track redraws at once, stops work from the keyboard, and edits survive going back.
 * They also read the downloaded file to prove it is a real PNG of the expected size.
 */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { button, eventCard, hasPageOverflow, openRide, rideStop } from "./helpers";

const PNG_SIGNATURE = "PNG";
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const EXPORT_SCALE = 2;
/** At 1280x800 the pinned bar may cover at most this much of the screen, down from about 204 pixels. */
const MAX_PINNED_BAR_HEIGHT = 130;

test("the ride shows every event, the legend and the creative note", async ({ page }) => {
  await openRide(page);
  await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
  await expect(page.getByRole("list", { name: "Marker colours" }).locator("li")).toHaveCount(4);
  await expect(page.getByText("not a measurement of your life")).toBeVisible();
});

test("changing a stop redraws the track at once", async ({ page }) => {
  await openRide(page);
  const path = page.getByTestId("ride-path");
  const original = await path.getAttribute("d");
  await rideStop(page, "Lost job").click();
  const details = page.getByRole("region", { name: "Selected stop" });
  await expect(details.getByRole("heading")).toHaveText("Lost job during the pandemic");
  await details.getByLabel("How it felt").selectOption("positive");
  await expect(path).not.toHaveAttribute("d", original ?? "");
  const afterSentiment = await path.getAttribute("d");
  await details.locator("input[type=range]").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(path).not.toHaveAttribute("d", afterSentiment ?? "");
});

test("stops can be selected from the keyboard", async ({ page }) => {
  await openRide(page);
  const details = page.getByRole("region", { name: "Selected stop" });
  await rideStop(page, "Started university").focus();
  await page.keyboard.press("Enter");
  await expect(details.getByRole("heading")).toHaveText("Started university");
  await rideStop(page, "Got married").focus();
  await page.keyboard.press("Space");
  await expect(details.getByRole("heading")).toHaveText("Got married");
  await expect(rideStop(page, "Got married")).toHaveAttribute("aria-pressed", "true");
});

test("ride edits are kept when going back", async ({ page }) => {
  await openRide(page);
  await rideStop(page, "Lost job").click();
  await page.getByRole("region", { name: "Selected stop" }).getByLabel("How it felt").selectOption("neutral");
  await button(page, "Edit my events").click();
  await expect(eventCard(page, 2).getByLabel("How it felt")).toHaveValue("neutral");
});

test("a long title is shortened on the track and shown in full in the details", async ({ page }) => {
  await openRide(page);
  await button(page, "Edit my events").click();
  await eventCard(page, 1).getByLabel("Title").fill("T".repeat(120));
  await button(page, "See my ride").click();
  const stop = rideStop(page, "TTT");
  await expect(stop.locator("text").first()).toHaveText(`${"T".repeat(19)}...`);
  await stop.click();
  await expect(page.getByRole("region", { name: "Selected stop" }).getByRole("heading")).toHaveText(
    "T".repeat(120),
  );
});

test("the track scrolls in its own area on a phone", async ({ page }) => {
  await openRide(page);
  expect(await hasPageOverflow(page)).toBe(false);
  const region = page.getByRole("region", { name: /Roller coaster/ });
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test("the draw-in animation runs by default", async ({ page }) => {
  await openRide(page);
  const name = await page.getByTestId("ride-path").evaluate((path) => getComputedStyle(path).animationName);
  expect(name).toBe("ride-track-draw");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the cart stays parked at the end of the track", async ({ page }) => {
    await openRide(page);
    await expect(page.getByTestId("ride-cart-parked")).toBeVisible();
    await expect(page.getByTestId("ride-cart-moving")).toBeHidden();
    await expect(button(page, "Ride again")).toBeHidden();
  });

  test("the draw-in animation is off", async ({ page }) => {
    await openRide(page);
    const name = await page.getByTestId("ride-path").evaluate((path) => getComputedStyle(path).animationName);
    expect(name).toBe("none");
  });
});

test("the image downloads as a PNG at twice the track size, with no upload", async ({ page }) => {
  await openRide(page);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("http")) {
      requests.push(request.url());
    }
  });
  const downloading = page.waitForEvent("download");
  await button(page, "Download image").click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("my-roller-coaster.png");
  const file = await readFile(await download.path());
  expect(file.subarray(1, 4).toString()).toBe(PNG_SIGNATURE);
  const viewBox = await page
    .getByRole("group", { name: "Your life as a roller coaster" })
    .getAttribute("viewBox");
  const [, , width, height] = (viewBox ?? "").split(" ").map(Number);
  expect(file.readUInt32BE(PNG_WIDTH_OFFSET)).toBe(width * EXPORT_SCALE);
  expect(file.readUInt32BE(PNG_HEIGHT_OFFSET)).toBe(height * EXPORT_SCALE);
  expect(requests).toEqual([]);
});

test("a failed export shows a friendly message and can be retried", async ({ page }) => {
  await openRide(page);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
  });
  await button(page, "Download image").click();
  await expect(page.getByText("could not create your image")).toBeVisible();
  await expect(button(page, "Download image")).toBeEnabled();
});

test.describe("ride styles and titles", () => {
  test("the coaster is the default style", async ({ page }) => {
    await openRide(page);
    await expect(page.getByRole("radio", { name: /Coaster/ })).toBeChecked();
  });

  test("loop-the-loops redraws the rail and keeps every stop", async ({ page }) => {
    await openRide(page);
    const path = page.getByTestId("ride-path");
    const coaster = await path.getAttribute("d");
    await page.getByRole("radio", { name: /Loop-the-loops/ }).check();
    await expect(path).not.toHaveAttribute("d", coaster ?? "");
    await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
    await expect(page.getByRole("group", { name: /with loops/ })).toBeVisible();
  });

  test("the metro map names one line for each category, and stops stay editable", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: /Metro map/ }).check();
    const lines = page.getByTestId("ride-path");
    await expect(lines).toHaveCount(4);
    const map = page.getByRole("group", { name: "Your life as a metro map" });
    await expect(map.getByText("Career", { exact: true })).toBeVisible();
    const original = await lines.first().getAttribute("d");
    await rideStop(page, "Started university").click();
    await page.getByRole("region", { name: "Selected stop" }).getByLabel("How it felt").selectOption("negative");
    await expect(lines.first()).not.toHaveAttribute("d", original ?? "");
  });

  test("the title shows in the drawing and adds height to the image", async ({ page }) => {
    await openRide(page);
    const drawing = page.getByRole("group", { name: "Your life as a roller coaster" });
    const before = await drawing.getAttribute("viewBox");
    await page.getByLabel("Name your ride").fill("My 20s Roller Coaster");
    await expect(drawing.getByText("My 20s Roller Coaster")).toBeVisible();
    await expect(drawing).not.toHaveAttribute("viewBox", before ?? "");
    await page.getByLabel("Name your ride").fill("");
    await expect(drawing).toHaveAttribute("viewBox", before ?? "");
  });

  test("the title stops at the maximum length", async ({ page }) => {
    await openRide(page);
    await page.getByLabel("Name your ride").pressSequentially("x".repeat(60));
    await expect(page.getByLabel("Name your ride")).toHaveValue("x".repeat(50));
  });

  test("style and title survive leaving the ride", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await page.getByLabel("Name your ride").fill("Kept");
    await button(page, "Edit my events").click();
    await button(page, "See my ride").click();
    await expect(page.getByRole("radio", { name: /Metro map/ })).toBeChecked();
    await expect(page.getByLabel("Name your ride")).toHaveValue("Kept");
  });

  test("the drawing starts as an illustrated scene, and Simple removes it", async ({ page }) => {
    await openRide(page);
    await expect(page.getByRole("radio", { name: "Sunny day" })).toBeChecked();
    await expect(page.getByTestId("scene-sky")).toHaveCount(1);
    await expect(page.getByTestId("trestle")).toHaveCount(1);
    await page.getByRole("radio", { name: "Simple" }).check();
    await expect(page.getByTestId("scene-sky")).toHaveCount(0);
    await expect(page.getByTestId("trestle")).toHaveCount(0);
    await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
  });

  test("themes change only the look, and survive leaving the ride", async ({ page }) => {
    await openRide(page);
    const sky = page.getByTestId("scene-sky");
    const path = await page.getByTestId("ride-path").getAttribute("d");
    await page.getByRole("radio", { name: "Starry night" }).check();
    await expect(page.getByTestId("ride-path")).toHaveAttribute("d", path ?? "");
    await button(page, "Edit my events").click();
    await button(page, "See my ride").click();
    await expect(page.getByRole("radio", { name: "Starry night" })).toBeChecked();
    await expect(sky).toHaveCount(1);
  });

  test("the cart rides the real rail, and only coasters have one", async ({ page }) => {
    await openRide(page);
    const motion = page.locator("animateMotion");
    await expect(motion).toHaveAttribute("path", (await page.getByTestId("ride-path").getAttribute("d")) ?? "");
    await expect(page.getByTestId("ride-cart-moving")).toBeVisible();
    await expect(page.getByTestId("ride-cart-parked")).toBeHidden();
    await expect(button(page, "Ride again")).toBeVisible();
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await expect(motion).toHaveCount(0);
    await expect(button(page, "Ride again")).toHaveCount(0);
  });

  test("Ride again restarts the ride without changing it", async ({ page }) => {
    await openRide(page);
    const motion = page.locator("animateMotion");
    await motion.evaluate((element) => element.setAttribute("data-first", "yes"));
    await button(page, "Ride again").click();
    await expect(page.locator('animateMotion[data-first="yes"]')).toHaveCount(0);
    await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
  });

  test("the character starts as Smiley, and choosing one changes both carts", async ({ page }) => {
    await openRide(page);
    await expect(page.getByRole("radio", { name: "Smiley" })).toBeChecked();
    await page.getByRole("radio", { name: "Robot" }).check();
    const moving = page.getByTestId("ride-cart-moving").locator("[data-rider]");
    const parked = page.getByTestId("ride-cart-parked").locator("[data-rider]");
    await expect(moving).toHaveAttribute("data-rider", "robot");
    await expect(parked).toHaveAttribute("data-rider", "robot");
  });

  test("the character picker shows only when there is a cart", async ({ page }) => {
    await openRide(page);
    const picker = page.getByRole("group", { name: "Choose your character" });
    await expect(picker).toBeVisible();
    await page.getByRole("radio", { name: /Loop-the-loops/ }).check();
    await expect(picker).toBeVisible();
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await expect(picker).toHaveCount(0);
    await page.getByRole("radio", { name: /Coaster/ }).check();
    await page.getByRole("radio", { name: "Simple" }).check();
    await expect(picker).toHaveCount(0);
  });

  test("the character survives switching style and leaving the ride", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Astronaut" }).check();
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await page.getByRole("radio", { name: /Coaster/ }).check();
    await expect(page.getByRole("radio", { name: "Astronaut" })).toBeChecked();
    await button(page, "Edit my events").click();
    await button(page, "See my ride").click();
    await expect(page.getByRole("radio", { name: "Astronaut" })).toBeChecked();
  });

  test("the look bar sits right above the drawing, so a choice and its result stay in view", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openRide(page);
    /** Someone choosing a look has opened Make it yours, not the Edit menu as well. */
    await page.locator("summary", { hasText: "Edit" }).click();
    const bar = await page.getByTestId("ride-look-bar").boundingBox();
    const drawing = await page.locator('svg[role="group"]').boundingBox();
    const title = await page.getByLabel("Name your ride").boundingBox();
    expect(drawing?.y).toBeGreaterThan((bar?.y ?? 0) + (bar?.height ?? 0) - 1);
    expect(drawing?.y).toBeLessThan(800 / 2 + 100);
    expect(title?.y).toBeGreaterThan(drawing?.y ?? 0);
    await page.mouse.wheel(0, 500);
    await expect.poll(async () => (await page.getByTestId("ride-look-bar").boundingBox())?.y).toBe(0);
  });

  test("the pinned look bar stays short on a laptop screen, so it hides little of the drawing", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openRide(page);
    const bar = await page.getByTestId("ride-look-bar").boundingBox();
    expect(bar?.height).toBeLessThanOrEqual(MAX_PINNED_BAR_HEIGHT);
    await expect(page.getByRole("radio", { name: "Metro map" })).toBeVisible();
  });

  test("every theme has a preview card, and choosing one works from the keyboard", async ({ page }) => {
    await openRide(page);
    const themes = page.locator("input[name=ride-theme]");
    await expect(page.getByTestId("theme-preview")).toHaveCount(await themes.count());
    await themes.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(themes.nth(1)).toBeChecked();
  });

  test("fit to screen is optional, and shows the whole ride without scrolling", async ({ page }) => {
    await page.goto("/sample");
    const region = page.getByRole("region", { name: /Roller coaster/ });
    const fit = button(page, "Fit to screen");
    const scrolls = () => region.evaluate((element) => element.scrollWidth > element.clientWidth);
    await expect(fit).toHaveAttribute("aria-pressed", "false");
    expect(await scrolls()).toBe(true);
    await fit.click();
    await expect(fit).toHaveAttribute("aria-pressed", "true");
    await expect.poll(scrolls).toBe(false);
    expect(await hasPageOverflow(page)).toBe(false);
    await fit.click();
    await expect.poll(scrolls).toBe(true);
  });

  test("fit to screen is kept after editing, and does not change the image size", async ({ page }) => {
    await openRide(page);
    const viewBox = await page.locator('svg[role="group"]').getAttribute("viewBox");
    await button(page, "Fit to screen").click();
    await expect(page.locator('svg[role="group"]')).toHaveAttribute("viewBox", viewBox ?? "");
    await button(page, "Edit my events").click();
    await button(page, "See my ride").click();
    await expect(button(page, "Fit to screen")).toHaveAttribute("aria-pressed", "true");
    const [, , width, height] = (viewBox ?? "").split(" ").map(Number);
    const downloading = page.waitForEvent("download");
    await button(page, "Download image").click();
    const file = await readFile(await (await downloading).path());
    expect(file.readUInt32BE(PNG_WIDTH_OFFSET)).toBe(width * EXPORT_SCALE);
    expect(file.readUInt32BE(PNG_HEIGHT_OFFSET)).toBe(height * EXPORT_SCALE);
  });

  test("the balloon sits in front of the steel and behind the stops", async ({ page }) => {
    await openRide(page);
    const order = await page.locator('svg[role="group"]').evaluate((svg) => {
      const position = (selector: string) =>
        Array.from(svg.querySelectorAll("*")).findIndex((element) => element.matches(selector));
      return {
        steel: position('[data-testid="trestle"]'),
        balloon: position('[data-testid="sky-balloon"]'),
        stop: position('g[role="button"]'),
      };
    });
    expect(order.balloon).toBeGreaterThan(order.steel);
    expect(order.stop).toBeGreaterThan(order.balloon);
  });

  test("each world draws its own journey and vehicle", async ({ page }) => {
    await openRide(page);
    for (const [theme, marker] of [["Space mission", "space-planet"], ["Ocean voyage", "ocean-fish"], ["Mountain trek", "mountain-pine"]]) {
      await page.getByRole("radio", { name: theme, exact: true }).check();
      await expect(page.getByTestId(marker).first()).toBeAttached();
      await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
    }
    await page.getByRole("radio", { name: "Arcade level", exact: true }).check();
    await expect(page.getByTestId("mode-structure")).toHaveCount(1);
  });

  test("the garden grows a vine whose stops bloom, thorn or sprout by feeling", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Growing garden", exact: true }).check();
    const stops = await page.locator('svg g[role="button"]').count();
    const blooms = page.locator('[data-testid="garden-flower"], [data-testid="garden-thorns"], [data-testid="garden-sprout"]');
    await expect(blooms).toHaveCount(stops);
    await expect(page.getByTestId("garden-leaf").first()).toBeAttached();
    await expect(page.getByTestId("garden-cane")).toHaveCount(stops);
    await expect(page.locator('[data-testid^="garden-season-"]').first()).toBeAttached();
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("the constellation turns every stop into a star joined by lines", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Your constellation", exact: true }).check();
    const stops = await page.locator('svg g[role="button"]').count();
    await expect(page.getByTestId("constellation-star")).toHaveCount(stops);
    const links = page.locator('[data-testid="constellation-line"], [data-testid="constellation-bridge"]');
    await expect(links).toHaveCount(stops - 1);
    await expect(page.getByTestId("constellation-moon")).toBeAttached();
    await expect(page.getByTestId("sky-balloon")).toHaveCount(0);
    await expect(page.getByTestId("ride-cart-moving").locator("[data-rider]")).toHaveCount(1);
  });

  test("each art mode draws its own backdrop and structure", async ({ page }) => {
    await openRide(page);
    const drawing = page.locator('svg[role="group"]');
    const seen = new Set<string>();
    for (const theme of ["Classic Ride", "Nightmare Mode", "Minimal Mode", "Retro Mode"]) {
      await page.getByRole("radio", { name: theme, exact: true }).check();
      await expect(page.getByTestId("mode-backdrop")).toHaveCount(1);
      await expect(page.getByTestId("mode-structure")).toHaveCount(1);
      await expect(page.locator('svg g[role="button"]')).toHaveCount(4);
      seen.add(await page.getByTestId("mode-structure").innerHTML());
    }
    expect(seen.size).toBe(4);
    await expect(drawing).toBeVisible();
  });

  test("Nightmare Mode has signs and a wet floor reflection", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Nightmare Mode" }).check();
    await expect(page.getByTestId("neon-sign").first()).toBeVisible();
    await expect(page.getByTestId("neon-reflection")).toHaveCount(1);
  });

  test("Minimal Mode drops the colour legend, and stops stay editable", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Minimal Mode" }).check();
    await expect(page.getByRole("list", { name: "Marker colours" })).toHaveCount(0);
    /** Labels are outlined tags, so a rail passing behind one never looks cut. */
    await expect(rideStop(page, "Got married").locator("rect[rx]")).toHaveAttribute("stroke", "#111111");
    await rideStop(page, "Got married").click();
    await expect(page.getByRole("region", { name: "Selected stop" }).getByRole("heading")).toHaveText("Got married");
  });

  test("Nightmare Mode leaves signs off metro maps, and Minimal lines stay distinct", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await page.getByRole("radio", { name: "Nightmare Mode", exact: true }).check();
    await expect(page.getByTestId("neon-sign")).toHaveCount(0);
    await page.getByRole("radio", { name: "Minimal Mode", exact: true }).check();
    const dashes = await page.getByTestId("ride-path").evaluateAll((lines) => lines.map((line) => line.getAttribute("stroke-dasharray")));
    expect(new Set(dashes).size).toBe(dashes.length);
  });

  test("Minimal Mode draws the Metro map with no colour", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: /Metro map/ }).check();
    await page.getByRole("radio", { name: "Minimal Mode", exact: true }).check();
    const colours = await page.locator('svg[role="group"] [stroke], svg[role="group"] [fill]').evaluateAll((nodes) =>
      nodes.flatMap((n) => [n.getAttribute("stroke"), n.getAttribute("fill")]).filter((v): v is string => Boolean(v) && /^#[0-9a-f]{6}$/i.test(v ?? "")),
    );
    const coloured = colours.filter((hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return Math.max(r, g, b) - Math.min(r, g, b) > 8;
    });
    expect(coloured).toEqual([]);
  });

  test("Retro fairground and Haunted night draw their own scenery", async ({ page }) => {
    await openRide(page);
    await page.getByRole("radio", { name: "Retro fairground" }).check();
    await expect(page.getByTestId("scene-wheel").first()).toBeVisible();
    await expect(page.getByTestId("scene-tent").first()).toBeVisible();
    await expect(page.getByTestId("scene-bat")).toHaveCount(0);
    await page.getByRole("radio", { name: "Haunted night" }).check();
    await expect(page.getByTestId("scene-bat").first()).toBeVisible();
    await expect(page.getByTestId("scene-tower").first()).toBeVisible();
    await expect(page.getByTestId("scene-wheel")).toHaveCount(0);
    await page.getByRole("radio", { name: "Sunny day" }).check();
    await expect(page.getByTestId("scene-orb")).toHaveCount(0);
  });

});
