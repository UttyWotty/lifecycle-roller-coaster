/**
 * Turkish words for Life statistics and the life report panel, including how years and moves are written.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {first}, are kept as they are and filled in when the message is shown.
 */
import type { stats as english } from "../en/stats";

export const stats: Record<keyof typeof english, string> = {
  heading: "Hayat istatistikleri",
  moments: "Anlar",
  bigMoments: "Büyük anlar",
  bigChanges: "Büyük değişimler",
  yearsCovered: "Kapsanan yıllar",
  biggestComeback: "En büyük dönüş",
  biggestDrop: "En büyük düşüş",
  longestSteady: "En uzun sakin dönem",
  topTheme: "En sık konu",
  notEnough: "Henüz yeterli olay yok",
  move: "{from} → {to}",
  yearRange: "{first}–{last}",
  reportLabel: "Hayat raporu",
  reportHeading: "Hayat raporun",
  reportAiNote: "Yapay zekâ bunu hikâyeni okurken yazdı, bu yüzden sonraki değişikliklerin içinde yok.",
  reportSampleNote: "Bu uydurma örnek hayatın bir parçası.",
};
