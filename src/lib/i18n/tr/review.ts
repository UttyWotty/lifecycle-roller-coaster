/**
 * Turkish words for the review stage and the reading notes: event cards, their fields, list actions and errors.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {position}, are kept as they are and filled in when the message is shown.
 */
import type { review as english } from "../en/review";

export const review: Record<keyof typeof english, string> = {
  heading: "Olaylarını gözden geçir",
  intro: "Bu adım isteğe bağlı. İçine sinmeyen her şeyi değiştirebilirsin.",
  backToStory: "Hikâyeme dön",
  noEvents: "Henüz olay yok. Ne olduğunu ve aşağı yukarı ne zaman olduğunu ekle.",
  addEvent: "Olay ekle",
  sortByDate: "Tarihe göre sırala",
  seeRide: "Trenimi göster",
  removed: "{title} kaldırıldı.",
  untitled: "Başlıksız olay",
  undo: "Geri al",
  fixFields: "{count} olaydaki işaretli alanları düzelt.",
  eventHeading: "Olay {position}",
  bestGuess: "Tahmin",
  looksRight: "Doğru görünüyor",
  looksRightLabel: "{position}. olay doğru görünüyor",
  moveUp: "Yukarı taşı",
  moveUpLabel: "{position}. olayı yukarı taşı",
  moveDown: "Aşağı taşı",
  moveDownLabel: "{position}. olayı aşağı taşı",
  delete: "Sil",
  deleteLabel: "{position}. olayı sil",
  titleLabel: "Başlık",
  titleError: "Bu olaya bir başlık ekle.",
  dateLabel: "Tarih",
  datePlaceholder: "2015, 2015-06 ya da 2015-06-30",
  dateError: "2015, 2015-06 ya da 2015-06-30 gibi gerçek bir tarih yaz veya boş bırak.",
  categoryLabel: "Kategori",
  descriptionLabel: "Açıklama",
  feelingLabel: "Nasıl hissettirdi",
  impactLabel: "Etki: {impact} / {max}",
  sampleNotice: "Bu örnek bir hayat. Kişi de hikâye de uydurma ve hazırlanması hiçbir şeye mal olmadı.",
  demoTitle: "Demo modu: bunlar örnek olaylar, senin hikâyen değil",
  demoDetails:
    "Yapay zekâ yazdıklarını okumadı. Hikâyeni okuması için .env dosyasına bir API anahtarı ekle, EXTRACTOR_MODE=anthropic ayarla ve uygulamayı yeniden başlat.",
  questionsHeading: "Birkaç soru",
};
