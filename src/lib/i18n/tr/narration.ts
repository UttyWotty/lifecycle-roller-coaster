/**
 * Turkish words the narrated ride speaks: each stop's place, its date the way people say it, and the ending.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {month}, are kept as they are and filled in when the line is built.
 */
import type { narration as english } from "../en/narration";

export const narration: Record<keyof typeof english, string> = {
  stop: "Durak {number}, toplam {count}. {date}. {title}",
  end: "Yolculuğun sonu.",
  monthYear: "{month} {year}",
  dayMonthYear: "{day} {month} {year}",
  month1: "Ocak",
  month2: "Şubat",
  month3: "Mart",
  month4: "Nisan",
  month5: "Mayıs",
  month6: "Haziran",
  month7: "Temmuz",
  month8: "Ağustos",
  month9: "Eylül",
  month10: "Ekim",
  month11: "Kasım",
  month12: "Aralık",
};
