/**
 * Pure index of every message in every language, grouped by the part of the app that shows them.
 * English sets the keys; each other language must give exactly the same ones, so the build fails on a missing message.
 * translate() looks a message up by "group.key" and fills its placeholders, falling back to English for safety.
 */
import { common as enCommon } from "./en/common";
import { events as enEvents } from "./en/events";
import { landing as enLanding } from "./en/landing";
import { lenses as enLenses } from "./en/lenses";
import { look as enLook } from "./en/look";
import { myRides as enMyRides } from "./en/myRides";
import { narration as enNarration } from "./en/narration";
import { pictures as enPictures } from "./en/pictures";
import { review as enReview } from "./en/review";
import { ride as enRide } from "./en/ride";
import { share as enShare } from "./en/share";
import { stats as enStats } from "./en/stats";
import { story as enStory } from "./en/story";
import { fill, type Locale } from "./locales";
import { common as trCommon } from "./tr/common";
import { events as trEvents } from "./tr/events";
import { landing as trLanding } from "./tr/landing";
import { lenses as trLenses } from "./tr/lenses";
import { look as trLook } from "./tr/look";
import { myRides as trMyRides } from "./tr/myRides";
import { narration as trNarration } from "./tr/narration";
import { pictures as trPictures } from "./tr/pictures";
import { review as trReview } from "./tr/review";
import { ride as trRide } from "./tr/ride";
import { share as trShare } from "./tr/share";
import { stats as trStats } from "./tr/stats";
import { story as trStory } from "./tr/story";

const ENGLISH = {
  common: enCommon,
  landing: enLanding,
  story: enStory,
  review: enReview,
  events: enEvents,
  myRides: enMyRides,
  ride: enRide,
  look: enLook,
  lenses: enLenses,
  stats: enStats,
  pictures: enPictures,
  share: enShare,
  narration: enNarration,
};

type Messages = { [Group in keyof typeof ENGLISH]: Record<keyof (typeof ENGLISH)[Group], string> };

const MESSAGES: Readonly<Record<Locale, Messages>> = {
  en: ENGLISH,
  tr: {
    common: trCommon,
    landing: trLanding,
    story: trStory,
    review: trReview,
    events: trEvents,
    myRides: trMyRides,
    ride: trRide,
    look: trLook,
    lenses: trLenses,
    stats: trStats,
    pictures: trPictures,
    share: trShare,
    narration: trNarration,
  },
};

/** Every message's address, such as "landing.title". */
export type MessageKey = { [Group in keyof Messages]: `${Group}.${keyof Messages[Group] & string}` }[keyof Messages];

const KEY_SEPARATOR = ".";

export function translate(locale: Locale, key: MessageKey, values: Readonly<Record<string, string | number>> = {}): string {
  const [group, name] = key.split(KEY_SEPARATOR) as [keyof Messages, string];
  const template = (MESSAGES[locale][group] as Record<string, string>)[name] ?? (MESSAGES.en[group] as Record<string, string>)[name];
  return fill(template, values);
}

/** Every key of every group, for checking that each language covers them all. */
export function messageKeys(locale: Locale): string[] {
  return Object.entries(MESSAGES[locale]).flatMap(([group, entries]) => Object.keys(entries).map((name) => `${group}${KEY_SEPARATOR}${name}`));
}
