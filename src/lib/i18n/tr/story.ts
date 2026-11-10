/**
 * Turkish words for the writing stage: the story box, Generate, the sample button, the privacy note and every error.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {count}, are kept as they are and filled in when the message is shown.
 */
import type { story as english } from "../en/story";

export const story: Record<keyof typeof english, string> = {
  heading: "Hikâyeni anlat",
  intro: "Hayatını şekillendiren anları kendi sözlerinle, istediğin sırayla yaz.",
  trySample: "Örnek bir hayat dene",
  sampleHint: "Yazmaya hazır değil misin? Uydurma bir hayatı hız treni olarak gör. Ücretsiz ve hiçbir yere bir şey gönderilmez.",
  storyLabel: "Hikâyen",
  placeholder: "2015'te üniversiteye başladım. Çok heyecanlıydım...",
  promptUniversity: "Üniversiteye başladığım yıl",
  promptFirstJob: "İlk işim",
  promptHardest: "En zor anım",
  promptMovedTo: "Taşındığım yer",
  promptNeverForget: "Asla unutmayacağım yıl",
  promptButton: "{prompt}...",
  characterCount: "{count} / {max} karakter",
  generate: "Trenimi oluştur",
  loading: "Hikâyen okunuyor...",
  replaceWarning: "Yeniden oluşturursan şimdiki olayların ve onlarda yaptığın değişiklikler silinir.",
  privacyNote:
    "\"Trenimi oluştur\" düğmesine bastığında hikâyen, içindeki olayları bulmak için Anthropic'in Claude API'sine gönderilir. Ondan önce hiçbir şey gönderilmez; bu uygulama hikâyeni kaydetmez ve sayfadan çıktığında hikâyen kaybolur.",
  tooLong: "Bu hikâye sınırı aşıyor. Devam etmek için biraz kısalt.",
  returnToRide: "Trenime dön",
  addManually: "Yapay zekâyı atla, olayları kendim ekleyeyim",
  errorNetwork: "Sunucuya ulaşamadık. Bağlantını kontrol edip tekrar dene.",
  errorFallback: "Hikâyen okunurken bir şeyler ters gitti. Lütfen tekrar dene.",
  errorRefused:
    "Bu hikâyeyi bir trene dönüştüremedik. Senin bir hatan yok. Farklı sözlerle yazmak ya da bir kısmını çıkarmak işe yarayabilir.",
  errorTruncated: "Bu hikâyede bir seferde okuyabileceğimizden fazla olay var. Daha kısa bir hâlini dene.",
  errorRateLimited: "Tren şu an çok kalabalık. Bir dakika sonra tekrar dene.",
  errorVisitorLimit:
    "Kısa sürede çok fazla tren yaptın. Biraz mola verip sonra tekrar dene ya da örnek bir hayata göz at.",
  errorDailyLimit:
    "Bugünün ücretsiz hikâye okumaları bitti. Yarın tekrar gel ya da bu arada örnek bir hayata göz at.",
  errorForbidden: "Bu istek otomatik gibi göründüğü için engellendi. Sayfayı yenileyip tekrar dene.",
  errorNotConfigured: "Hikâye okuyucu bu sunucuda henüz kurulmamış.",
  errorTooLarge: "Bu hikâye gönderilemeyecek kadar uzun. Kısaltıp tekrar dene.",
};
