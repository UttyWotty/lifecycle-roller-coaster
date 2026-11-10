/**
 * Browser tests for Ride it sounds.
 * They confirm sound starts off, is remembered on the device, and creates no audio at all while off.
 * They also confirm a ride with sound on makes sounds as it moves and raises no page errors.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

/** Counts audio contexts and started sounds without playing anything through the speakers. */
async function watchAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const counts = { contexts: 0, sounds: 0 };
    (window as Window & { audioCounts?: typeof counts }).audioCounts = counts;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor() {
        super();
        counts.contexts += 1;
      }
    };
    const start = AudioScheduledSourceNode.prototype.start;
    AudioScheduledSourceNode.prototype.start = function (...args: Parameters<typeof start>) {
      counts.sounds += 1;
      return start.apply(this, args);
    };
  });
}

function audioCounts(page: Page): Promise<{ contexts: number; sounds: number }> {
  return page.evaluate(() => (window as Window & { audioCounts?: { contexts: number; sounds: number } }).audioCounts ?? { contexts: -1, sounds: -1 });
}

test("sound starts off, creates no audio, and is remembered once turned on", async ({ page }) => {
  await watchAudio(page);
  await openRide(page);
  await expect(button(page, "Sound")).toHaveAttribute("aria-pressed", "false");
  await button(page, "Ride it").click();
  await button(page, "Next").click();
  expect(await audioCounts(page)).toEqual({ contexts: 0, sounds: 0 });
  await button(page, "Sound").click();
  await expect(button(page, "Sound")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(button(page, "Sound")).toHaveAttribute("aria-pressed", "true");
});

test("a ride with sound on makes sounds without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await watchAudio(page);
  await openRide(page);
  await button(page, "Sound").click();
  await button(page, "Ride it").click();
  await expect.poll(async () => (await audioCounts(page)).sounds, { timeout: 10_000 }).toBeGreaterThan(0);
  expect((await audioCounts(page)).contexts).toBe(1);
  await button(page, "Next").click();
  await button(page, "Pause").click();
  await button(page, "Exit ride").click();
  expect(errors).toEqual([]);
});
