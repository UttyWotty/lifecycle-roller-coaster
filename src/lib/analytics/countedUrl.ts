/**
 * Pure privacy rules for page-view counting: what part of an address may be counted.
 * Shared rides live in the part after "#", and query strings could carry anything, so only the origin and path are kept.
 * Anything that is not a valid address is not counted at all.
 */

/** Exposed by Vercel to the browser build; only the live site counts page views. */
export const COUNTED_ENVIRONMENT = "production";
/** Only web pages are counted; any other kind of address is dropped. */
const WEB_PROTOCOLS: readonly string[] = ["http:", "https:"];

/** A web address reduced to origin and path, or null when it is unreadable or not a web page and must not be sent. */
export function countedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return WEB_PROTOCOLS.includes(parsed.protocol) ? `${parsed.origin}${parsed.pathname}` : null;
  } catch {
    return null;
  }
}

/** Whether a build should count page views, from the deployment environment Vercel reports. */
export function shouldCountPageViews(environment: string | undefined): boolean {
  return environment === COUNTED_ENVIRONMENT;
}
