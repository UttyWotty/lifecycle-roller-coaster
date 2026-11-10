/**
 * Turkish words for viewing a ride someone shared, on its own page and embedded in another website.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces are kept as they are and filled in when the message is shown.
 */
import type { shared as english } from "../en/shared";

export const shared: Record<keyof typeof english, string> = {
  note: "Biri bu treni seninle paylaştı. Yalnızca bu bağlantının içinde yaşar, hiçbir yerde saklanmaz.",
  brokenTitle: "Bu tren bağlantısı çalışmıyor",
  brokenDetails: "Kopyalanırken kesilmiş olabilir. Bağlantıyı yeniden iste ya da kendi trenini yap.",
  untitled: "Paylaşılan bir tren",
  makeOwn: "Kendi trenimi yap",
  guessInvite: "Bu treni iyi bildiğini mi düşünüyorsun? Her durağın nasıl hissettirdiğini ve ne kadar büyük olduğunu, açılmadan önce tahmin et.",
  guessStart: "Trenimi tahmin et",
  togetherWithMine: "Kendi trenimle birlikte sür",
  noSavedRide: "Önce bu cihazda kendi trenini yap. Sonra bu bağlantıyı yeniden aç ve birlikte sürün.",
  makeMyRide: "Trenimi yap",
  embedBroken: "Bu tren gösterilemedi. Yerleştirme kodu kopyalanırken kesilmiş olabilir.",
  openFull: "Trenin tamamını aç",
  embedMakeOwn: "Kendi trenini yap",
};
