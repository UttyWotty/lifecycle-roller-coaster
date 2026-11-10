/**
 * Browser tests for the theme music, counting audio without playing anything through the speakers.
 * They confirm Music starts off, makes no audio while off, and is remembered once turned on.
 * They also confirm a ride with Music on starts notes, pausing stops them, and a video with Music on still records.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

interface AudioCounts {
  contexts: number;
  oscillators: number;
  stopped: number;
}

/** Counts audio contexts and oscillators started and stopped early. */
async function watchAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const counts = { contexts: 0, oscillators: 0, stopped: 0 };
    (window as Window & { audioCounts?: typeof counts }).audioCounts = counts;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor() {
        super();
        counts.contexts += 1;
      }
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args: Parameters<typeof start>) {
      counts.oscillators += 1;
      return start.apply(this, args);
    };
    const stop = AudioScheduledSourceNode.prototype.stop;
    AudioScheduledSourceNode.prototype.stop = function (...args: Parameters<typeof stop>) {
      if (args.length === 0) {
        counts.stopped += 1;
      }
      return stop.apply(this, args);
    };
  });
}

function audioCounts(page: Page): Promise<AudioCounts> {
  return page.evaluate(() => (window as Window & { audioCounts?: AudioCounts }).audioCounts ?? { contexts: -1, oscillators: -1, stopped: -1 });
}

test("Music starts off, makes no audio while off, and is remembered", async ({ page }) => {
  await watchAudio(page);
  await openRide(page);
  await expect(button(page, "Music")).toHaveAttribute("aria-pressed", "false");
  await button(page, "Ride it").click();
  await button(page, "Next").click();
  expect(await audioCounts(page)).toMatchObject({ contexts: 0, oscillators: 0 });
  await button(page, "Exit ride").click();
  await button(page, "Music").click();
  await page.reload();
  await expect(button(page, "Music")).toHaveAttribute("aria-pressed", "true");
});

test("a ride with Music on plays notes, and Pause stops them", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await watchAudio(page);
  await openRide(page);
  await button(page, "Music").click();
  await button(page, "Ride it").click();
  await expect.poll(async () => (await audioCounts(page)).oscillators).toBeGreaterThan(10);
  await button(page, "Pause").click();
  await expect.poll(async () => (await audioCounts(page)).stopped).toBeGreaterThan(0);
  const paused = (await audioCounts(page)).oscillators;
  await page.waitForTimeout(600);
  expect((await audioCounts(page)).oscillators).toBe(paused);
  await button(page, "Exit ride").click();
  expect(errors).toEqual([]);
});

test("a ride video with Music on still records", async ({ page }) => {
  test.setTimeout(120_000);
  await openRide(page);
  await button(page, "Music").click();
  await button(page, "Non-stop").click();
  await page.evaluate(() => Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true }));
  const downloading = page.waitForEvent("download", { timeout: 110_000 });
  await button(page, "Make a ride video").click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^my-roller-coaster-ride\.(mp4|webm)$/);
});
