/**
 * Turkish words for sharing a ride by link from the ride screen, and for starting Ride together with a friend's link.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {title}, are kept as they are and filled in when the message is shown.
 */
import type { share as english } from "../en/share";

export const share: Record<keyof typeof english, string> = {
  shareLink: "Bağlantı paylaş",
  heading: "Treninin bağlantısını paylaş",
  contentsNote:
    "Bağlantıya sahip herkes bu treni görebilir: olay başlıkları, tarihler, her birinin nasıl hissettirdiği ve ne kadar önemli olduğu, bölüm adları ve başlık. Açıklamalar, hayat raporu ve hikâyen asla eklenmez; tren yalnızca bağlantının içinde yaşar.",
  linkLabel: "Treninin bağlantısı",
  shareSheet: "Paylaş...",
  copyLink: "Bağlantıyı kopyala",
  copyEmbed: "Yerleştirme kodunu kopyala",
  close: "Kapat",
  linkCopied: "Bağlantı kopyalandı. Trenini paylaşmak için istediğin yere yapıştır.",
  embedCopied: "Yerleştirme kodu kopyalandı. Trenini orada göstermek için web sitenin ya da blogunun HTML'ine yapıştır.",
  copyFailed: "Burada kopyalama engelli. Yukarıdaki bağlantıyı seçip kopyala.",
  email: "E-posta",
  message: "Hayat hikâyemde bir tur at.",
  messageTitled: "\"{title}\" treninde bir tur at.",
  together: "Birlikte sür",
  togetherIntro: "Bir arkadaşının tren bağlantısı mı var? Hayatlarınızı zamanda yan yana görmek için yapıştır.",
  friendLink: "Arkadaşının tren bağlantısı",
  notARide: "Bu bir tren bağlantısına benzemiyor. Arkadaşından \"Bağlantı paylaş\" ile yeniden göndermesini iste.",
};
