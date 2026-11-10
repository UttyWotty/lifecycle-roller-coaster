/**
 * Turkish names for the event categories and feelings, as the review fields and the ride controls show them.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Keys follow the values in the event schema, so a component can look a name up straight from an event.
 */
import type { events as english } from "../en/events";

export const events: Record<keyof typeof english, string> = {
  education: "Eğitim",
  career: "Kariyer",
  relationships: "İlişkiler",
  finance: "Para",
  business: "İş",
  personal: "Kişisel",
  health: "Sağlık",
  other: "Diğer",
  positive: "Olumlu",
  negative: "Olumsuz",
  neutral: "Nötr",
};
