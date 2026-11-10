/**
 * Browser tests for the writing, review and My rides screens in Turkish.
 * A Turkish browser walks the story box, an extraction error, the review stage and My rides, and finds Turkish there.
 * They also confirm no English interface words are left on those screens; the demo events themselves stay English.
 */
import { expect, test, type Page } from "@playwright/test";
import { STORY, button, eventCard } from "./helpers";

const ENDPOINT = "**/api/extract";
const RIDE_NAME = "Hayatım";

/** English interface words from these screens; none of them appears in the demo events' own text. */
const ENGLISH_WORDS = [
  "Tell your story", "Your story", "Generate", "Try a sample", "Skip AI", "characters", "Anthropic's",
  "Review your events", "Back to my story", "Add an event", "Sort by date", "See my ride", "Title", "Date",
  "Category", "Description", "How it felt", "Impact", "Best guess", "Looks right", "Move", "Delete", "Undo",
  "Demo mode", "My rides", "New ride", "Saved on this device", "Open", "Keep it", "stops", "Education",
  "Career", "Positive", "Negative", "Neutral", "Untitled",
];

/** Every visible word on the page plus the accessible names and placeholders that are not shown as text. */
async function interfaceText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const attributes = [...document.querySelectorAll("[aria-label], [placeholder]")].flatMap((element) => [
      element.getAttribute("aria-label") ?? "",
      element.getAttribute("placeholder") ?? "",
    ]);
    return [document.body.innerText, ...attributes].join("\n");
  });
}

async function expectNoEnglish(page: Page): Promise<void> {
  const text = await interfaceText(page);
  expect(ENGLISH_WORDS.filter((word) => text.includes(word))).toEqual([]);
}

test.use({ locale: "tr-TR" });

test("the story screen speaks Turkish, errors included", async ({ page }) => {
  await page.route(ENDPOINT, (route) => route.fulfill({ status: 429, json: { error: "daily_limit" } }));
  await page.goto("/story");
  await expect(page.getByRole("heading", { name: "Hikâyeni anlat" })).toBeVisible();
  const story = page.getByRole("textbox", { name: "Hikâyen" });
  await button(page, "İlk işim...").click();
  await expect(story).toHaveValue("İlk işim ");
  await story.fill(STORY);
  await expect(page.getByText(`${STORY.length} / 20.000 karakter`)).toBeVisible();
  await button(page, "Trenimi oluştur").click();
  await expect(page.getByRole("status").getByText("Yarın tekrar gel")).toBeVisible();
  await expectNoEnglish(page);
});

test("review and My rides speak Turkish", async ({ page }) => {
  await page.goto("/story");
  await page.getByRole("textbox", { name: "Hikâyen" }).fill(STORY);
  await button(page, "Trenimi oluştur").click();
  await page.getByRole("heading", { name: "Your ride" }).waitFor();
  await expect(button(page, "Baştan başla")).toBeVisible();
  await page.getByLabel("Name your ride").fill(RIDE_NAME);
  await button(page, "Edit my events").click();
  await expect(page.getByRole("heading", { name: "Olaylarını gözden geçir" })).toBeVisible();
  await expect(page.getByText("Demo modu: bunlar örnek olaylar, senin hikâyen değil")).toBeVisible();
  await expect(eventCard(page, 1).getByLabel("Başlık")).toHaveValue("Started university");
  await expect(eventCard(page, 1).getByLabel("Kategori").locator("option:checked")).toHaveText("Eğitim");
  await expect(eventCard(page, 1).getByText("Etki: 7 / 10")).toBeVisible();
  await expect(page.getByRole("button", { name: "4. olay doğru görünüyor" })).toBeVisible();

  await button(page, "Olay ekle").click();
  await expect(eventCard(page, 5).getByText("Bu olaya bir başlık ekle.")).toBeVisible();
  await expect(page.getByText("1 olaydaki işaretli alanları düzelt.")).toBeVisible();
  await page.getByRole("button", { name: "5. olayı sil" }).click();
  await expect(page.getByText("Başlıksız olay kaldırıldı.")).toBeVisible();
  await expect(button(page, "Geri al")).toBeVisible();

  const myRides = page.getByRole("region", { name: "Trenlerim" });
  await expect(myRides.getByText("Yalnızca bu cihazda saklanır.")).toBeVisible();
  await expect(myRides.getByText("2015–2022 · 4 durak")).toBeVisible();
  await myRides.getByRole("button", { name: `Sil: ${RIDE_NAME}` }).click();
  await expect(myRides.getByText("Bu tren bu cihazdan silinsin mi?")).toBeVisible();
  await expect(myRides.getByRole("button", { name: `Evet, sil: ${RIDE_NAME}` })).toBeVisible();
  await expectNoEnglish(page);
  await myRides.getByRole("button", { name: "Kalsın" }).click();
  await expect(myRides.getByRole("button", { name: `Sil: ${RIDE_NAME}` })).toBeVisible();
});
