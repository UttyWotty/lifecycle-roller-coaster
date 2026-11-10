/**
 * Browser tests for riding together as a group of up to four.
 * They confirm three rides line up with a drawing and a cart each, and the card names everyone during the ride.
 * They also confirm a fourth ride can be added from its link, a bad link is refused, and a fifth cannot be added.
 */
import { expect, test } from "@playwright/test";
import { SAMPLE_LIVES } from "../src/lib/samples/sampleLives";
import { encodeSharedRide, type SharedRideInput } from "../src/lib/share/sharedRide";
import { encodeTogether } from "../src/lib/together/togetherLink";
import { button } from "./helpers";

function rideOf(index: number): SharedRideInput {
  const life = SAMPLE_LIVES[index];
  return { title: life.title, style: life.rideStyle, theme: life.rideTheme, rider: life.rider, events: life.events, chapters: life.chapters };
}

const GROUP = [0, 1, 2].map(rideOf);

test("three rides line up and ride together, naming everyone", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/together#${encodeTogether(GROUP)}`);
  await expect(page.getByRole("heading", { name: "Riding together" })).toBeVisible();
  await expect(page.getByText(`${GROUP[0].title}, ${GROUP[1].title} and ${GROUP[2].title}, with the same years lined up.`)).toBeVisible();
  const drawings = page.getByRole("region", { name: /^Three rides on one timeline/ }).locator("svg");
  await expect(drawings).toHaveCount(3);
  const widths = await drawings.evaluateAll((svgs) => svgs.map((svg) => svg.getAttribute("viewBox")?.split(" ")[2]));
  expect(new Set(widths).size).toBe(1);
  await button(page, "Ride together").click();
  await button(page, "Next").click();
  const panel = page.getByRole("region", { name: "Ride together" });
  for (const ride of GROUP) {
    await expect(panel.getByText(`${ride.title}:`)).toBeVisible();
  }
  await expect(page.getByTestId("playback-cart")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("a fourth ride can be added from its link, and then no more", async ({ page }) => {
  await page.goto(`/together#${encodeTogether(GROUP)}`);
  const add = page.getByRole("region", { name: "Add a friend's ride" });
  await add.getByLabel("Another ride link").fill("https://example.com/not-a-ride");
  await button(page, "Add to the ride").click();
  await expect(add.getByText("That does not look like a ride link.")).toBeVisible();
  await add.getByLabel("Another ride link").fill(`http://localhost/ride#${encodeSharedRide(rideOf(3))}`);
  await button(page, "Add to the ride").click();
  await expect(page.getByRole("region", { name: /^Four rides on one timeline/ }).locator("svg")).toHaveCount(4);
  await expect(page.getByText(rideOf(3).title, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Add a friend's ride" })).toHaveCount(0);
});

test("links with one or five rides show the friendly message", async ({ page }) => {
  const [first] = encodeTogether(GROUP).split("&");
  const five = `${encodeTogether([0, 1, 2, 3].map(rideOf))}&e=${first.slice(2)}`;
  for (const fragment of [first, five]) {
    await page.goto(`/together#${fragment}`);
    await expect(page.getByRole("heading", { name: "This ride together does not work" })).toBeVisible();
  }
});
