/**
 * Turkish words for the feedback page, where visitors say how the app was and share ideas.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {max}, are kept as they are and filled in when the message is shown.
 */
import type { feedback as english } from "../en/feedback";

export const feedback: Record<keyof typeof english, string> = {
  pageTitle: "Ne düşündüğünü anlat",
  intro: "Bir fikir, bir hata ya da yolculuğun nasıl geçtiği: her mesaj okunur.",
  reactionLegend: "Nasıldı?",
  loved: "Bayıldım",
  fine: "Fena değildi",
  confusing: "Kafa karıştıran bir şey vardı",
  messageLabel: "Eklemek istediğin bir şey var mı? (isteğe bağlı)",
  messageHint: "En fazla {max} karakter. Lütfen özel bilgileri yazma.",
  counter: "{count} / {max}",
  privacyNote:
    "Yalnızca seçimin, yazdıkların, dil ve gün saklanır. Hikâyen, olayların ve kim olduğun asla birlikte gönderilmez.",
  send: "Gönder",
  sending: "Gönderiliyor...",
  thanks: "Teşekkürler! Mesajın ulaştı.",
  sendAnother: "Bir tane daha gönder",
  backToApp: "Uygulamaya dön",
  chooseReaction: "Lütfen önce nasıl olduğunu seç.",
  tooLong: "Bu mesaj biraz uzun. Lütfen {max} karakteri geçmesin.",
  rateLimited: "Teşekkürler, şimdilik bu kadarı yeter. Lütfen daha sonra yeniden dene.",
  unavailable: "Şu anda mesaj alınamıyor. Lütfen daha sonra yeniden dene; yazdıkların kutuda duruyor.",
  offline: "Siteye ulaşılamadı. Bağlantını kontrol edip yeniden dene; yazdıkların kutuda duruyor.",
  footerLink: "Geri bildirim gönder",
  rideLink: "Yolculuğun nasıldı? Bize anlat",
};
