/**
 * Turkish words for Guess my ride, where a friend guesses how each stop of a shared ride felt and how big it was.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {score}, are kept as they are and filled in when the message is shown.
 */
import type { guess as english } from "../en/guess";

export const guess: Record<keyof typeof english, string> = {
  region: "Trenimi tahmin et",
  progress: "Durak {number} / {count} · {date} · Puan {score}",
  feelingQuestion: "Nasıl hissettirdi?",
  sizeQuestion: "Ne kadar büyüktü?",
  feelingPositive: "İyi",
  feelingNegative: "Zor",
  feelingNeutral: "İkisi arası",
  sizeSmall: "Küçük (1-3)",
  sizeMedium: "Orta (4-6)",
  sizeBig: "Büyük (7-10)",
  feltPositive: "iyi",
  feltNegative: "zor",
  feltNeutral: "ikisi arası",
  wasSmall: "küçük",
  wasMedium: "orta",
  wasBig: "büyük",
  truth: "{feeling} hissettirdi ve {size} bir duraktı (10 üzerinden {impact}).",
  judged: "His: {feeling}. Büyüklük: {size}.",
  right: "Doğru",
  wrong: "Pek değil",
  reveal: "Göster",
  nextStop: "Sonraki durak",
  stop: "Tahmini bırak",
  yourScore: "Puanın",
  shareScore: "Puanımı paylaş",
  playAgain: "Yeniden oyna",
  done: "Bitti",
  copied: "Puan kopyalandı. Arkadaşlarına meydan okumak için istediğin yere yapıştır.",
  shareFailed: "Burada paylaşım engelli.",
  verdictTop: "Bu treni kendin yapmış olabilirdin.",
  verdictHigh: "Bu treni gerçekten iyi tanıyorsun.",
  verdictMiddle: "Büyük anları biliyorsun.",
  verdictLow: "Bu trende sürprizler bol.",
  scoreTitled: "\"{title}\" trenini tahmin ederek {score}/{best} puan aldım. Beni geçebilir misin? {link}",
  scoreUntitled: "Bu treni tahmin ederek {score}/{best} puan aldım. Beni geçebilir misin? {link}",
};
