/**
 * Pure share URLs for the social apps a ride link can be posted to in one tap.
 * Each target puts the link inside the message text or its own field, so the part after "#" always survives.
 * Facebook and LinkedIn are left out because their share pages take a bare URL and may drop that fragment.
 */

export interface ShareTarget {
  name: string;
  url: string;
}

const SPACE = " ";
const LINE_BREAK = "\n\n";

export function shareTargets(link: string, message: string): ShareTarget[] {
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
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(`${message}${LINE_BREAK}${link}`)}`,
    },
  ];
}

/** The message posted with a link, naming the ride when it has a title. */
export function shareMessage(title: string): string {
  const trimmed = title.trim();
  return trimmed === "" ? "Take a ride through my life story." : `Take a ride through "${trimmed}".`;
}
