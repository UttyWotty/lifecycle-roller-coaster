/**
 * Turkish words for Ride together, where two to four shared rides are lined up in time and ridden at once.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {names}, are kept as they are and filled in when the message is shown.
 */
import type { together as english } from "../en/together";

export const together: Record<keyof typeof english, string> = {
  heading: "Birlikte sürüyoruz",
  intro: "{names}, aynı yıllar hizalanmış olarak.",
  namesJoined: "{rest} ve {last}",
  namesSeparator: ", ",
  firstRide: "Birinci tren",
  secondRide: "İkinci tren",
  thirdRide: "Üçüncü tren",
  fourthRide: "Dördüncü tren",
  styleLegend: "Tren stili",
  start: "Birlikte sür",
  sharedPair: "Aynı yıl, iki hikâye",
  sharedGroup: "Aynı yıl, birden çok hikâye",
  brokenTitle: "Bu ortak tren çalışmıyor",
  brokenDetails: "Bağlantı kopyalanırken kesilmiş olabilir. Yeniden iste ya da kendi trenini yap.",
  drawings: "Tek zaman çizgisinde {count} tren, küçük ekranlarda yana kayar",
  countTwo: "iki",
  countThree: "üç",
  countFour: "dört",
  drawingLabel: "{name}, hız treni olarak",
  panel: "Birlikte sür",
  starting: "Birbirinize sıkı tutunun, tren kalkıyor.",
  keyHint: "Tuşlar: Boşluk duraklatır, oklar zamanda gezer, Esc çıkar.",
  nothingHere: "Burada işaretli bir şey yok",
  endingNone: "İşte birlikte yolculuğunuz buydu. Büyük anlarınız hiç aynı yıla denk gelmedi.",
  endingPairOne: "İşte birlikte yolculuğunuz buydu. İkinizin de büyük anlar yaşadığı 1 yılı paylaştınız.",
  endingPairMany: "İşte birlikte yolculuğunuz buydu. İkinizin de büyük anlar yaşadığı {years} yılı paylaştınız.",
  endingGroupOne: "İşte birlikte yolculuğunuz buydu. Birden çoğunuzun büyük anlar yaşadığı 1 yılı paylaştınız.",
  endingGroupMany: "İşte birlikte yolculuğunuz buydu. Birden çoğunuzun büyük anlar yaşadığı {years} yılı paylaştınız.",
  shareHeading: "Bu ortak treni paylaş",
  shareNote:
    "Bu bağlantıya sahip herkes içindeki her treni görebilir: olay başlıkları, tarihler, her birinin nasıl hissettirdiği ve ne kadar önemli olduğu, bölüm adları ve başlıklar. Açıklamalar ve hikâyeler asla içinde değildir.",
  shareMessage: "{names} trenlerinde birlikte bir tur at.",
  linkCopied: "Bağlantı kopyalandı. Bu ortak treni paylaşmak için istediğin yere yapıştır.",
  copyFailed: "Burada kopyalama engelli. Adresi tarayıcından kopyala.",
  addHeading: "Bir arkadaşının trenini ekle",
  addIntro: "En fazla {max} kişiyle sür. Bu gruba eklemek için başka bir tren bağlantısı yapıştır.",
  addLink: "Başka bir tren bağlantısı",
  addButton: "Trene ekle",
};
