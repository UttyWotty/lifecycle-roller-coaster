/**
 * Turkish words for the ride's pictures and video: the download and share buttons, their messages, and the text
 * drawn into the story picture, the poster and the ride video.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {host}, are kept as they are and filled in when the message is shown.
 */
import type { pictures as english } from "../en/pictures";

export const pictures: Record<keyof typeof english, string> = {
  downloadImage: "Resmi indir",
  shareRide: "Trenimi paylaş",
  downloadPoster: "Posteri indir",
  posterSaved: "Posterin indirildi: A3 yatay, basılmaya hazır.",
  imageFailed: "Resmini oluşturamadık. Lütfen tekrar dene.",
  privacyNote:
    "Resim senin cihazında oluşturulur. Sen istemedikçe hiçbir şey paylaşılmaz. \"Trenimi paylaş\" bu trenin bağlantısıyla birlikte hikâye boyutunda bir resim gönderir; açıklamalar, hayat raporu ve hikâyen asla içinde olmaz.",
  imageCopied: "Resim kopyalandı. Trenini paylaşmak için istediğin yere yapıştır.",
  imageDownloaded: "Burada paylaşım yapılamıyor, bu yüzden resmin indirildi.",
  makeVideo: "Tren videosu yap",
  recordingNote: "Tren videon kaydediliyor. Bitene kadar bu sayfayı açık tut.",
  videoLabel: "Tren videosu",
  cancel: "Vazgeç",
  videoFailed: "Videonu yapamadık. Lütfen tekrar dene.",
  videoDownloaded: "Videon indirildi.",
  oneStop: "{count} durak",
  manyStops: "{count} durak",
  subtitleYear: "{year}, {stops}",
  subtitleYears: "{first}–{last}, {stops}",
  storyFooter: "Kendi trenini yap: {host}",
  videoIntro: "İşte trenim geliyor",
  videoEnding: "İşte benim trenim buydu.",
  videoEndingLink: "Seninkini yap: {host}",
};
