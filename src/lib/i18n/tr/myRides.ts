/**
 * Turkish words for My rides and the saved-ride note: the list, its actions, delete questions and storage notes.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {name}, are kept as they are and filled in when the message is shown.
 */
import type { myRides as english } from "../en/myRides";

export const myRides: Record<keyof typeof english, string> = {
  heading: "Trenlerim",
  newRide: "Yeni tren",
  fullNote: "{max} trenin var, bu cihazın saklayabileceği en fazla sayı bu. Yeni bir tren için birini sil.",
  privacyNote: "Yalnızca bu cihazda saklanır. Hikâye metnin asla tutulmaz.",
  untitled: "Başlıksız tren",
  openNow: "(şu an açık)",
  yearSpan: "{first}–{last}",
  oneStop: "{count} durak",
  manyStops: "{count} durak",
  confirmDelete: "Bu tren bu cihazdan silinsin mi?",
  yesDelete: "Evet, sil",
  yesDeleteLabel: "Evet, sil: {name}",
  keepIt: "Kalsın",
  open: "Aç",
  openLabel: "Aç: {name}",
  delete: "Sil",
  deleteLabel: "Sil: {name}",
  savedNote: "Trenin yalnızca bu cihazda saklanır, böylece geri döndüğünde burada olur. Hikâye metnin tutulmaz.",
  confirmStartOver: "Bu tren bu cihazdan silinip yenisine başlansın mı?",
  yesStartOver: "Evet, baştan başla",
  keepRide: "Trenim kalsın",
  startOver: "Baştan başla",
};
