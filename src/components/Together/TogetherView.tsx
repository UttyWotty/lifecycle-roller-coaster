/**
 * Ride together: two to four people's rides on one timeline, read from the link and shown side by side in time.
 * The rides share a style and theme the viewer can change, keep their own riders, and can be ridden together.
 * A link that is broken or not a group of rides shows a friendly message, and nothing from the link is saved.
 */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, type ReactElement } from "react";
import { CHOICE_PILL_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { ThemePicker } from "@/components/RollerCoaster/ThemePicker";
import type { RideTheme } from "@/lib/scene/themes";
import type { SharedRide } from "@/lib/share/sharedRide";
import { sharedMoments } from "@/lib/together/alignRides";
import { composeTogether, type TogetherStyle } from "@/lib/together/composeTogether";
import { namesInWords } from "@/lib/together/names";
import { decodeTogether } from "@/lib/together/togetherLink";
import { AddRideToGroup } from "./TogetherEntry";
import { TogetherDrawings } from "./TogetherDrawings";
import { TogetherPanel } from "./TogetherPanel";
import { TogetherShare } from "./TogetherShare";
import { useTogetherPlayback } from "./useTogetherPlayback";

const STYLES: readonly { id: TogetherStyle; name: string }[] = [
  { id: "coaster", name: "Coaster" },
  { id: "loops", name: "Loop-the-loops" },
];
const FALLBACK_NAMES = ["First ride", "Second ride", "Third ride", "Fourth ride"] as const;
const PRIMARY_LINK_CLASS = "inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-2 font-semibold text-on-accent";
const NO_FRAGMENT = "";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function startingStyle(ride: SharedRide): TogetherStyle {
  return ride.style === "loops" ? "loops" : "coaster";
}

function MakeYourOwn(): ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/story" className={PRIMARY_LINK_CLASS}>
        Make my own ride
      </Link>
      <Link href="/sample" className={`${SECONDARY_BUTTON_CLASS} inline-flex items-center`}>
        Try a sample life
      </Link>
    </div>
  );
}

function TogetherContent({ shared: rideList }: { shared: readonly SharedRide[] }): ReactElement {
  const [first] = rideList;
  const [style, setStyle] = useState<TogetherStyle>(startingStyle(first));
  const [theme, setTheme] = useState<RideTheme>(first.theme);
  const scroller = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const { aligned, rides } = useMemo(() => composeTogether(rideList, style, theme), [rideList, style, theme]);
  const names = rideList.map((ride, index) => ride.title.trim() || FALLBACK_NAMES[index]);
  const tracks = useMemo(() => rides.map(({ track }) => track), [rides]);
  const playback = useTogetherPlayback({ tracks, columns: aligned.columns, scroller, drawing });
  const column = playback.columnIndex === null ? null : aligned.columns[playback.columnIndex];
  const moments = rideList.map((ride, index) => {
    const entry = column?.entries[index] ?? null;
    return entry === null ? null : ride.events[entry];
  });
  const shared = sharedMoments(aligned.columns);
  const sharedHeading = rideList.length === 2 ? "The same year, two stories" : "The same year, more than one story";

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Riding together</h1>
      <p className="wrap-anywhere text-lg">
        {namesInWords(names)}, with the same years lined up.
      </p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
        <fieldset className="min-w-0 lg:shrink-0">
          <legend className="sr-only">Ride style</legend>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((option) => (
              <label key={option.id} className={CHOICE_PILL_CLASS}>
                <input
                  type="radio"
                  name="together-style"
                  checked={option.id === style}
                  onChange={() => setStyle(option.id)}
                  className="accent-accent"
                />
                {option.name}
              </label>
            ))}
          </div>
        </fieldset>
        <ThemePicker theme={theme} onThemeChange={setTheme} />
      </div>
      <TogetherDrawings
        rides={rides}
        names={names}
        highlighted={moments.map((event) => event?.id ?? null)}
        isRiding={playback.status !== null}
        cartRefs={playback.cartRefs}
        scroller={scroller}
        drawing={drawing}
      />
      {playback.status === null ? (
        <div>
          <button
            type="button"
            onClick={playback.start}
            className="min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent"
          >
            Ride together
          </button>
        </div>
      ) : (
        <TogetherPanel
          status={playback.status}
          date={column?.date ?? null}
          moments={column ? names.map((name, index) => ({ name, event: moments[index] })) : null}
          sharedYears={shared.length}
          rideCount={rideList.length}
          onTogglePause={playback.togglePause}
          onNext={playback.next}
          onBack={playback.back}
          onExit={playback.exit}
        />
      )}
      {shared.length > 0 && (
        <section aria-label={sharedHeading} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{sharedHeading}</h2>
          <ul className="flex flex-col gap-1">
            {shared.map((entry) => (
              <li key={entry.x} className="wrap-anywhere">
                <span className="font-semibold">{entry.date}:</span>{" "}
                {entry.entries.flatMap((index, ride) => (index === null ? [] : [rideList[ride].events[index].title])).join(" / ")}
              </li>
            ))}
          </ul>
        </section>
      )}
      <AddRideToGroup rides={rideList} />
      <TogetherShare names={names} />
      <MakeYourOwn />
    </section>
  );
}

export function TogetherView(): ReactElement {
  const fragment = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => NO_FRAGMENT);
  const rides = useMemo(() => decodeTogether(fragment), [fragment]);
  if (rides === null) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">This ride together does not work</h1>
        <p>The link may have been cut short when it was copied. Ask for it again, or make a ride of your own.</p>
        <MakeYourOwn />
      </section>
    );
  }
  return <TogetherContent key={fragment} shared={rides} />;
}
