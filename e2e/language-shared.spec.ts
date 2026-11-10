/**
 * Browser tests for the shared ride, Guess my ride, Ride together and the embed page in Turkish.
 * A Turkish browser opens each from a link, plays a guess, starts a ride together and finds Turkish there.
 * They also confirm no English interface words are left; the sample lives' own titles and events stay as written.
 */
import { expect, test, type Page } from "@playwright/test";
import { SAMPLE_LIVES } from "../src/lib/samples/sampleLives";
import { encodeSharedRide, type SharedRideInput } from "../src/lib/share/sharedRide";
import { encodeTogether } from "../src/lib/together/togetherLink";
import { button } from "./helpers";

/** English interface words from these pages; none of them appears in the sample lives. */
const ENGLISH_WORDS = [
  "Someone shared", "This ride link", "Make my own ride", "Try a sample life", "Guess my ride", "Think you know",
  "Ride together with my ride", "Make your own ride", "How did it feel", "How big was it", "In between", "Reveal",
  "Stop guessing", "Not quite", "Feeling:", "out of 10", "Next stop", "Stop 1 of", "Riding together",
  "with the same years", "rides on one timeline", "as a roller coaster", "Ride style", "Loop-the-loops",
  "The same year", "Add a friend", "Another ride link", "Add to the ride", "Share this ride together",
  "Anyone with this link", "Copy link", "Hold on together", "Keys:", "Pause", "Exit ride", "Nothing marked",
  "Open the full ride", "Date unknown", "Life statistics", "Download image",
];

function rideOf(index: number): SharedRideInput {
  const life = SAMPLE_LIVES[index];
  return { title: life.title, style: life.rideStyle, theme: life.rideTheme, rider: life.rider, events: life.events, chapters: life.chapters };
}

/** Every visible word on the page plus the accessible names and placeholders that are not shown as text. */
async function interfaceText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const attributes = [...document.querySelectorAll("[aria-label], [placeholder], [title]")].flatMap((element) => [
      element.getAttribute("aria-label") ?? "",
      element.getAttribute("placeholder") ?? "",
      element.getAttribute("title") ?? "",
    ]);
    return [document.body.innerText, ...attributes].join("\n");
  });
}

async function expectNoEnglish(page: Page): Promise<void> {
  const text = await interfaceText(page);
  expect(ENGLISH_WORDS.filter((word) => text.includes(word))).toEqual([]);
}

test.use({ locale: "tr-TR" });

test("a shared ride and Guess my ride speak Turkish", async ({ page }) => {
  await page.goto(`/ride#${encodeSharedRide(rideOf(0))}`);
  await expect(page.getByText("Biri bu treni seninle paylaştı.", { exact: false })).toBeVisible();
  await button(page, "Kendi trenimle birlikte sür").click();
  await expect(page.getByText("Önce bu cihazda kendi trenini yap.", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Trenimi yap", exact: true })).toBeVisible();
  await expectNoEnglish(page);

  await button(page, "Trenimi tahmin et").click();
  const game = page.getByRole("region", { name: "Trenimi tahmin et" });
  await expect(game.getByText(/^Durak 1 \/ \d+ · .+ · Puan 0$/)).toBeVisible();
  await game.getByRole("button", { name: "İyi" }).click();
  await game.getByRole("button", { name: "Küçük (1-3)" }).click();
  await game.getByRole("button", { name: "Göster" }).click();
  await expect(game.getByText(/hissettirdi ve .+ bir duraktı \(10 üzerinden \d+\)\./)).toBeVisible();
  await expect(game.getByText(/^His: (Doğru|Pek değil)\. Büyüklük: (Doğru|Pek değil)\.$/)).toBeVisible();
  await expect(game.getByRole("button", { name: "Sonraki durak" })).toBeVisible();
  await expectNoEnglish(page);
  await game.getByRole("button", { name: "Tahmini bırak" }).click();
  await expect(game).toHaveCount(0);
});

test("a broken ride link explains itself in Turkish", async ({ page }) => {
  await page.goto("/ride#r=broken");
  await expect(page.getByRole("heading", { name: "Bu tren bağlantısı çalışmıyor" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kendi trenimi yap" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Örnek bir hayat dene" })).toBeVisible();
  await expectNoEnglish(page);
});

test("Ride together speaks Turkish, from the names to the ride itself", async ({ page }) => {
  const group = [0, 1, 2].map(rideOf);
  await page.goto(`/together#${encodeTogether(group)}`);
  await expect(page.getByRole("heading", { name: "Birlikte sürüyoruz" })).toBeVisible();
  await expect(page.getByText(`${group[0].title}, ${group[1].title} ve ${group[2].title}, aynı yıllar hizalanmış olarak.`)).toBeVisible();
  await expect(page.getByRole("region", { name: /^Tek zaman çizgisinde üç tren/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Taklalı" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Bir arkadaşının trenini ekle" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Bu ortak treni paylaş" })).toBeVisible();
  await expectNoEnglish(page);

  await button(page, "Birlikte sür").click();
  const panel = page.getByRole("region", { name: "Birlikte sür" });
  await expect(panel.getByRole("button", { name: "Duraklat" })).toBeVisible();
  await panel.getByRole("button", { name: "İleri" }).click();
  await expect(panel.getByText(`${group[0].title}:`, { exact: false })).toBeVisible();
  await expectNoEnglish(page);
  await panel.getByRole("button", { name: "Trenden in" }).click();
  await expect(panel).toHaveCount(0);
});

test("a broken ride together link explains itself in Turkish", async ({ page }) => {
  await page.goto("/together#a=broken");
  await expect(page.getByRole("heading", { name: "Bu ortak tren çalışmıyor" })).toBeVisible();
  await expectNoEnglish(page);
});

test("the embed page speaks Turkish", async ({ page }) => {
  await page.goto(`/embed#${encodeSharedRide(rideOf(0))}`);
  await expect(page.getByRole("link", { name: "Trenin tamamını aç" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kendi trenini yap" })).toBeVisible();
  await expectNoEnglish(page);
  await page.goto("/embed#r=broken");
  await expect(page.getByText("Bu tren gösterilemedi.", { exact: false })).toBeVisible();
});

test("the end of a Turkish guess game shows a Turkish score, verdict and shared message", async ({ page }) => {
  await page.goto(`/ride#${encodeSharedRide(rideOf(0))}`);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const copied: string[] = [];
    (window as Window & { copied?: string[] }).copied = copied;
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => void copied.push(text) }, configurable: true });
  });
  await button(page, "Trenimi tahmin et").click();
  const game = page.getByRole("region", { name: "Trenimi tahmin et" });
  const total = Number((await game.getByText(/^Durak 1 \/ \d+/).innerText()).match(/\/ (\d+)/)?.[1]);
  for (let stop = 1; stop <= total; stop += 1) {
    await game.getByRole("button", { name: "İyi" }).click();
    await game.getByRole("button", { name: "Büyük (7-10)" }).click();
    await game.getByRole("button", { name: "Göster" }).click();
    if (stop < total) {
      await game.getByRole("button", { name: "Sonraki durak" }).click();
    }
  }
  await expect(game.getByText("Puanın")).toBeVisible();
  await expectNoEnglish(page);
  await game.getByRole("button", { name: "Puanımı paylaş" }).click();
  await expect(page.getByText("Puan kopyalandı.", { exact: false })).toBeVisible();
  const copied = await page.evaluate(() => (window as Window & { copied?: string[] }).copied ?? []);
  expect(copied[0]).toMatch(/puan aldım\. Beni geçebilir misin\? .*\/ride#r=/);
  expect(copied[0]).not.toMatch(/I scored/);
});

test("adding something that is not a ride says so in Turkish", async ({ page }) => {
  await page.goto(`/together#${encodeTogether([0, 1].map(rideOf))}`);
  await page.getByLabel("Başka bir tren bağlantısı").fill("https://example.com/nothing");
  await button(page, "Trene ekle").click();
  const text = await interfaceText(page);
  expect(text).not.toMatch(/not a ride|does not look/i);
});
