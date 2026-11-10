/**
 * Browser tests for the narrated ride, with the device's voice replaced by a recorder so nothing is spoken aloud.
 * They confirm Narrate starts off, says nothing while off, and is remembered once turned on.
 * They also confirm each stop is spoken as the ride reaches it, Next speaks the stop landed on, and Pause and Exit stop the voice.
 */
import { expect, test, type Page } from "@playwright/test";
import { button, openRide } from "./helpers";

interface SpeechLog {
  spoken: string[];
  cancels: number;
}

/** Replaces speech with a recorder of what would have been said. */
async function recordSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log = { spoken: [] as string[], cancels: 0 };
    (window as Window & { speechLog?: typeof log }).speechLog = log;
    Object.defineProperty(window, "speechSynthesis", {
      value: { speak: (utterance: SpeechSynthesisUtterance) => log.spoken.push(utterance.text), cancel: () => (log.cancels += 1) },
      configurable: true,
    });
  });
}

function speechLog(page: Page): Promise<SpeechLog> {
  return page.evaluate(() => (window as Window & { speechLog?: SpeechLog }).speechLog ?? { spoken: [], cancels: -1 });
}

test("Narrate starts off, says nothing while off, and is remembered", async ({ page }) => {
  await recordSpeech(page);
  await openRide(page);
  await expect(button(page, "Narrate")).toHaveAttribute("aria-pressed", "false");
  await button(page, "Ride it").click();
  await button(page, "Next").click();
  expect((await speechLog(page)).spoken).toEqual([]);
  await button(page, "Exit ride").click();
  await button(page, "Narrate").click();
  await page.reload();
  await expect(button(page, "Narrate")).toHaveAttribute("aria-pressed", "true");
});

test("each stop is spoken as the ride reaches it, and Pause and Exit stop the voice", async ({ page }) => {
  await recordSpeech(page);
  await openRide(page);
  await button(page, "Narrate").click();
  await button(page, "Ride it").click();
  await expect.poll(async () => (await speechLog(page)).spoken[0], { timeout: 10_000 }).toMatch(/^Stop 1 of \d+\. 2015\. Started university\.$/);
  await button(page, "Next").click();
  await expect.poll(async () => (await speechLog(page)).spoken.at(-1)).toMatch(/^Stop 2 of \d+\./);
  const before = await speechLog(page);
  await button(page, "Pause").click();
  await expect.poll(async () => (await speechLog(page)).cancels).toBeGreaterThan(before.cancels);
  await button(page, "Play").click();
  await button(page, "Exit ride").click();
  const after = await speechLog(page);
  expect(after.spoken.filter((line) => line.startsWith("Stop 2 of"))).toHaveLength(1);
});

test("without a speech voice, there is no Narrate button", async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
  });
  await openRide(page);
  await expect(button(page, "Sound")).toBeVisible();
  await expect(button(page, "Narrate")).toHaveCount(0);
});
