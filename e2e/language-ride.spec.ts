/**
 * Browser tests for the ride screen in Turkish.
 * A Turkish browser walks the ride, its look choices, lenses, statistics, report, export and share controls, a future
 * stop with its TODAY sign, Ride it from start to end and the narration, and finds Turkish there.
 * They also confirm no English interface words are left on the screen; the demo events and report themselves stay English.
 */
import { expect, test, type Page } from "@playwright/test";
import { STORY, button } from "./helpers";

const FUTURE_TITLE = "Lizbon'a taşınmak";

/** English interface words from the ride screen; none of them appears in the demo events, chapters or report. */
const ENGLISH_WORDS = [
  "Your ride", "Edit my events", "Add a future stop", "Ride it", "Ride again", "Sound", "Music", "Narrate",
  "Non-stop", "Fit to screen", "Select a stop", "creative picture", "scrolls sideways", "Ride style", "Theme",
  "Loop-the-loops", "Metro map", "Art modes", "Worlds", "Scenes", "Classic Ride", "Sunny day", "Haunted night",
  "Choose your character", "Smiley", "Astronaut", "Ghost", "Ride lens", "Whole life", "Born in", "Name your ride",
  "Life statistics", "Moments", "Big changes", "Years covered", "Biggest comeback", "Biggest drop", "Longest steady",
  "Most common theme", "Not enough", "Life report", "Written by AI", "Download image", "Share my ride",
  "Download poster", "ride video", "Share a link", "Ride together", "Friend's ride link", "Marker colours",
  "Education", "Career", "Relationships", "Health", "Date unknown", "TODAY", "Stop 1 of", "Hold on tight",
  "End of the ride", "Still to come", "still to come", "Keys:", "Pause", "Exit ride", "Back to my story",
  "Selected stop", "impact", "positive", "negative", "My Life Roller Coaster", "image is created",
];

/** Every visible word on the page plus the accessible names, titles and placeholders that are not shown as text. */
async function interfaceText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const attributes = [...document.querySelectorAll("[aria-label], [placeholder], [title]")].flatMap((element) => [
      element.getAttribute("aria-label") ?? "",
      element.getAttribute("placeholder") ?? "",
      element.getAttribute("title") ?? "",
    ]);
    const svgText = [...document.querySelectorAll("svg text")].map((element) => element.textContent ?? "");
    return [document.body.innerText, ...attributes, ...svgText].join("\n");
  });
}

async function expectNoEnglish(page: Page): Promise<void> {
  const text = await interfaceText(page);
  expect(ENGLISH_WORDS.filter((word) => text.includes(word))).toEqual([]);
}

/** Replaces speech with a recorder of each line and the language it was given. */
async function recordSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: { text: string; lang: string }[] = [];
    (window as Window & { speechLog?: typeof log }).speechLog = log;
    Object.defineProperty(window, "speechSynthesis", {
      value: { speak: (utterance: SpeechSynthesisUtterance) => log.push({ text: utterance.text, lang: utterance.lang }), cancel: () => undefined },
      configurable: true,
    });
  });
}

function spoken(page: Page): Promise<{ text: string; lang: string }[]> {
  return page.evaluate(() => (window as Window & { speechLog?: { text: string; lang: string }[] }).speechLog ?? []);
}

async function openTurkishRide(page: Page): Promise<void> {
  await page.goto("/story");
  await page.getByRole("textbox", { name: "Hikâyen" }).fill(STORY);
  await button(page, "Trenimi oluştur").click();
  await page.getByRole("heading", { name: "Trenin" }).waitFor();
}

test.use({ locale: "tr-TR" });

test("the ride screen speaks Turkish, from the look choices to statistics and sharing", async ({ page }) => {
  await openTurkishRide(page);
  await expect(page.getByRole("radio", { name: "Hız treni" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Klasik tren" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Tüm hayat" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Got married, 2022, olumlu, etki 9" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Ran a first marathon, Tarih yok,/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "İşaret renkleri" }).getByText("Eğitim")).toBeVisible();

  const stats = page.getByRole("region", { name: "Hayat istatistikleri" });
  await expect(stats.getByText("Kapsanan yıllar")).toBeVisible();
  await expect(stats.getByText("2015–2022")).toBeVisible();
  await expect(page.getByRole("region", { name: "Hayat raporu" }).getByText("Yapay zekâ bunu hikâyeni okurken yazdı", { exact: false })).toBeVisible();

  await page.getByRole("radio", { name: "Taklalı" }).check();
  await expect(page.getByRole("group", { name: "Taklalı bir hız treni olarak hayatın" })).toBeVisible();
  await page.getByLabel("Doğum yılın (isteğe bağlı)").fill("1995");
  await expect(page.getByRole("radio", { name: "20'lerim" })).toBeVisible();
  await page.getByRole("button", { name: "Got married, 2022, olumlu, etki 9" }).click();
  await expect(page.getByRole("region", { name: "Seçili durak" }).getByText("Etki: 9 / 10")).toBeVisible();
  await button(page, "Bağlantı paylaş").click();
  await expect(page.getByRole("heading", { name: "Treninin bağlantısını paylaş" })).toBeVisible();
  await expect(button(page, "Trenimi paylaş")).toBeVisible();
  await expectNoEnglish(page);
});

test("a future stop, Ride it and the narration speak Turkish", async ({ page }) => {
  await recordSpeech(page);
  await openTurkishRide(page);
  await button(page, "Gelecekten bir durak ekle").click();
  await page.locator("ol > li").last().getByLabel("Başlık").fill(FUTURE_TITLE);
  await button(page, "Trenimi göster").click();
  await page.getByRole("heading", { name: "Trenin" }).waitFor();
  await expect(page.getByTestId("future-veil").getByText("BUGÜN")).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(`^${FUTURE_TITLE}, \\d{4}, henüz gelmedi, nötr`) })).toBeVisible();

  await button(page, "Anlat").click();
  await button(page, "Bin ve sür").click();
  const panel = page.getByRole("region", { name: "Bin ve sür" });
  await expect(panel.getByText(/^Durak 1 \/ 4 · 2015$/)).toBeVisible({ timeout: 10_000 });
  await expect.poll(async () => (await spoken(page))[0], { timeout: 10_000 }).toEqual({
    text: "Durak 1, toplam 4. 2015. Started university.",
    lang: "tr-TR",
  });
  await expect(button(page, "Duraklat")).toBeVisible();
  await expectNoEnglish(page);
  const ending = panel.getByText("Yolculuğun sonu", { exact: true });
  await expect(async () => {
    await page.keyboard.press("ArrowRight");
    await expect(ending).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await expect(panel.getByText("Bugünden sonra seni bekleyenler:")).toBeVisible();
  await expect(panel.getByText(new RegExp(`^${FUTURE_TITLE} \\(\\d{4}\\)$`))).toBeVisible();
  await expect(button(page, "Yeniden sür")).toBeVisible();
  await expect.poll(async () => (await spoken(page)).at(-1)).toEqual({ text: "Yolculuğun sonu.", lang: "tr-TR" });
  await expectNoEnglish(page);
  await button(page, "Trenden in").click();
  await expect(panel).toHaveCount(0);
});
