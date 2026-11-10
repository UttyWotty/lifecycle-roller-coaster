/**
 * Pure builder for the snippet that shows a ride on another website: an iframe of this site's embed page.
 * The ride travels in the address's fragment, as in a share link, so the embedding site's server never receives it.
 * Every value is escaped for an HTML attribute, so a ride's title can never break out of the snippet.
 */

export const EMBED_PATH = "/embed";
const SITE_NAME = "Lifecycle Roller Coaster";
const UNTITLED = "A ride";
/** Tall enough for the title, the drawing and its buttons on a blog column. */
const EMBED_HEIGHT = 460;

function escapeAttribute(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("'", "&#39;");
}

/** The iframe snippet for a ride, given this site's origin and the ride's encoded fragment. */
export function embedCode(origin: string, fragment: string, title: string): string {
  const source = `${origin}${EMBED_PATH}#${fragment}`;
  const label = `${title.trim() || UNTITLED} - ${SITE_NAME}`;
  return (
    `<iframe src="${escapeAttribute(source)}" title="${escapeAttribute(label)}" width="100%" height="${EMBED_HEIGHT}" ` +
    `style="border:0" loading="lazy"></iframe>`
  );
}
