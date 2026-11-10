/**
 * The ways into Ride together: from a friend's shared ride using your own saved ride, by pasting a friend's link, or by
 * adding another friend's link to a group. Each builds the link in the browser and opens it; nothing is sent anywhere.
 * Each says what to do when something is missing, such as no saved ride or a link that is not a ride.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { FIELD_CLASS, LABEL_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";
import { loadSavedRide } from "@/components/RideFlow/rideStorage";
import { decodeSharedRide, type SharedRide, type SharedRideInput } from "@/lib/share/sharedRide";
import { MAX_TOGETHER_RIDES, encodeTogether } from "@/lib/together/togetherLink";

const TOGETHER_PATH = "/together";
const NO_MESSAGE = "";
const FRAGMENT_START = "#";

function togetherHref(rides: readonly SharedRideInput[]): string {
  return `${TOGETHER_PATH}#${encodeTogether(rides)}`;
}

/** The ride in a pasted share link, or null when it is not one. */
function rideFromLink(link: string): SharedRide | null {
  const fragmentAt = link.indexOf(FRAGMENT_START);
  return fragmentAt === -1 ? null : decodeSharedRide(link.slice(fragmentAt));
}

/** On a friend's shared ride: pairs it with the ride saved on this device. */
export function RideTogetherWithMine({ theirs }: { theirs: SharedRideInput }): ReactElement {
  const t = useT();
  const router = useRouter();
  const [hasNoSavedRide, setHasNoSavedRide] = useState(false);

  function start(): void {
    const saved = loadSavedRide();
    if (saved === null) {
      setHasNoSavedRide(true);
      return;
    }
    const mine = { title: saved.title, style: saved.style, theme: saved.theme, rider: saved.rider, events: saved.events, chapters: saved.chapters };
    router.push(togetherHref([mine, theirs]));
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button type="button" onClick={start} className={SECONDARY_BUTTON_CLASS}>
          {t("shared.togetherWithMine")}
        </button>
      </div>
      <p role="status" className="text-sm">
        {hasNoSavedRide ? t("shared.noSavedRide") : NO_MESSAGE}{" "}
        {hasNoSavedRide && (
          <Link href="/story" className="underline">
            {t("shared.makeMyRide")}
          </Link>
        )}
      </p>
    </div>
  );
}

/** On your own ride: paste a friend's link to ride together. */
export function RideTogetherInvite({ mine }: { mine: SharedRideInput }): ReactElement {
  const t = useT();
  const router = useRouter();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function start(): void {
    const theirs = rideFromLink(link);
    if (theirs === null) {
      setError(t("share.notARide"));
      return;
    }
    router.push(togetherHref([mine, theirs]));
  }

  return (
    <section aria-label={t("share.together")} className="flex flex-col gap-2">
      <h2 className="font-semibold">{t("share.together")}</h2>
      <p className="text-sm">{t("share.togetherIntro")}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className={`${LABEL_CLASS} flex-1`}>
          {t("share.friendLink")}
          <input
            type="url"
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setError("");
            }}
            placeholder="https://.../ride#r=..."
            className={FIELD_CLASS}
          />
        </label>
        <button type="button" onClick={start} disabled={link.trim() === ""} className={SECONDARY_BUTTON_CLASS}>
          {t("share.together")}
        </button>
      </div>
      <p role="status" className="text-sm">
        {error}
      </p>
    </section>
  );
}

/** On a ride together: paste one more friend's link to make the group bigger, up to the most a link can carry. */
export function AddRideToGroup({ rides }: { rides: readonly SharedRide[] }): ReactElement | null {
  const t = useT();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  if (rides.length >= MAX_TOGETHER_RIDES) {
    return null;
  }

  function add(): void {
    const theirs = rideFromLink(link);
    if (theirs === null) {
      setError(t("share.notARide"));
      return;
    }
    /** Already on the together page, so only the fragment changes; setting it directly fires the page's hashchange. */
    window.location.hash = encodeTogether([...rides, theirs]);
  }

  return (
    <section aria-label={t("together.addHeading")} className="flex flex-col gap-2 rounded-lg border border-muted p-4">
      <h2 className="font-semibold">{t("together.addHeading")}</h2>
      <p className="text-sm">{t("together.addIntro", { max: MAX_TOGETHER_RIDES })}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className={`${LABEL_CLASS} flex-1`}>
          {t("together.addLink")}
          <input
            type="url"
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setError("");
            }}
            placeholder="https://.../ride#r=..."
            className={FIELD_CLASS}
          />
        </label>
        <button type="button" onClick={add} disabled={link.trim() === ""} className={SECONDARY_BUTTON_CLASS}>
          {t("together.addButton")}
        </button>
      </div>
      <p role="status" className="text-sm">
        {error}
      </p>
    </section>
  );
}
