/**
 * The two ways into Ride together: from a friend's shared ride using your own saved ride, or by pasting a friend's link.
 * Both build a pair link in the browser and open it; nothing is sent anywhere until the user shares that link.
 * Each says what to do when something is missing, such as no saved ride or a link that is not a ride.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { FIELD_CLASS, LABEL_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { loadSavedRide } from "@/components/RideFlow/rideStorage";
import { decodeSharedRide, type SharedRideInput } from "@/lib/share/sharedRide";
import { encodeTogether } from "@/lib/together/togetherLink";

const TOGETHER_PATH = "/together";
const NO_SAVED_RIDE =
  "Make your own ride first, on this device. Then open this link again and ride together.";
const NOT_A_RIDE = "That does not look like a ride link. Ask your friend to use Share a link and send it again.";
const FRAGMENT_START = "#";

function togetherHref(mine: SharedRideInput, theirs: SharedRideInput): string {
  return `${TOGETHER_PATH}#${encodeTogether(mine, theirs)}`;
}

/** On a friend's shared ride: pairs it with the ride saved on this device. */
export function RideTogetherWithMine({ theirs }: { theirs: SharedRideInput }): ReactElement {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function start(): void {
    const saved = loadSavedRide();
    if (saved === null) {
      setMessage(NO_SAVED_RIDE);
      return;
    }
    const mine = { title: saved.title, style: saved.style, theme: saved.theme, rider: saved.rider, events: saved.events, chapters: saved.chapters };
    router.push(togetherHref(mine, theirs));
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button type="button" onClick={start} className={SECONDARY_BUTTON_CLASS}>
          Ride together with my ride
        </button>
      </div>
      <p role="status" className="text-sm">
        {message}{" "}
        {message === NO_SAVED_RIDE && (
          <Link href="/story" className="underline">
            Make my ride
          </Link>
        )}
      </p>
    </div>
  );
}

/** On your own ride: paste a friend's link to ride together. */
export function RideTogetherInvite({ mine }: { mine: SharedRideInput }): ReactElement {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function start(): void {
    const fragmentAt = link.indexOf(FRAGMENT_START);
    const theirs = fragmentAt === -1 ? null : decodeSharedRide(link.slice(fragmentAt));
    if (theirs === null) {
      setError(NOT_A_RIDE);
      return;
    }
    router.push(togetherHref(mine, theirs));
  }

  return (
    <section aria-label="Ride together" className="flex flex-col gap-2">
      <h2 className="font-semibold">Ride together</h2>
      <p className="text-sm">Got a friend&apos;s ride link? Paste it to see your lives side by side in time.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className={`${LABEL_CLASS} flex-1`}>
          Friend&apos;s ride link
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
          Ride together
        </button>
      </div>
      <p role="status" className="text-sm">
        {error}
      </p>
    </section>
  );
}
