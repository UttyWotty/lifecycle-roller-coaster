/**
 * Turkish words used across the whole app: the language picker and the site footer.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {name}, are kept as they are and filled in when the message is shown.
 */
import type { common as english } from "../en/common";

export const common: Record<keyof typeof english, string> = {
  languageLabel: "Dil",
  footerPrivacy: "Hesap gerekmez. Hikâye metnin asla kaydedilmez.",
};
