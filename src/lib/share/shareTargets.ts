/**
 * Pure share URLs for the social apps a ride link can be posted to in one tap.
 * Each target puts the link inside the message text or its own field, so the part after "#" always survives.
 * Facebook and LinkedIn are left out because their share pages take a bare URL and may drop that fragment.
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

export interface ShareTarget {
  name: string;
  url: string;
}

const SPACE = " ";
const LINE_BREAK = "\n\n";

/** The targets in one tap; the Email target is named in the given language, English (DEFAULT_LOCALE) unless one is passed. */
export function shareTargets(link: string, message: string, locale: Locale = DEFAULT_LOCALE): ShareTarget[] {
  const withLink = `${message}${SPACE}${link}`;
  return [
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`,
    },
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(withLink)}` },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
    },
    {
      name: translate(locale, "share.email"),
      url: `mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(`${message}${LINE_BREAK}${link}`)}`,
    },
  ];
}

/** The message posted with a link, naming the ride when it has a title, in the given language (English by default). */
export function shareMessage(title: string, locale: Locale = DEFAULT_LOCALE): string {
  const trimmed = title.trim();
  return trimmed === "" ? translate(locale, "share.message") : translate(locale, "share.messageTitled", { title: trimmed });
}
