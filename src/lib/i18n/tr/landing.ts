/**
 * Turkish words for the landing page: the welcome, the two ways to start, the example ride and the theme strip.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Placeholders in braces, such as {name}, are kept as they are and filled in when the message is shown.
 */
import type { landing as english } from "../en/landing";

export const landing: Record<keyof typeof english, string> = {
  title: "Lifecycle Roller Coaster",
  tagline: "Hayat bir yolculuk. Bakalım senin trenin neye benziyor.",
  intro: "Hikâyeni kendi sözlerinle yaz; iniş ve çıkışların bir hız trenine dönüşsün. Hesap açman gerekmez.",
  start: "Yolculuğa başla",
  trySample: "Örnek bir hayat dene",
  exampleLabel: "Güneşli bir şehirde, mutlu anlarda yükselen ve zor anlarda düşen örnek bir hız treni rayı.",
  themesLabel: "Temalar",
  themesHeading: "Trenin için bir görünüm seç",
};
