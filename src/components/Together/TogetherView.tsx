/**
 * Ride together: two people's rides on one timeline, read from the link and shown side by side in time.
 * Both rides share a style and theme the viewer can change, keep their own riders, and can be ridden together.
 * A link that is broken or not a pair shows a friendly message, and nothing from the link is saved.
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
import { decodeTogether } from "@/lib/together/togetherLink";
import { TogetherDrawings } from "./TogetherDrawings";
import { TogetherPanel } from "./TogetherPanel";
import { TogetherShare } from "./TogetherShare";
import { useTogetherPlayback } from "./useTogetherPlayback";

const STYLES: readonly { id: TogetherStyle; name: string }[] = [
  { id: "coaster", name: "Coaster" },
  { id: "loops", name: "Loop-the-loops" },
];
const FALLBACK_NAMES = ["First ride", "Second ride"] as const;
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

function TogetherContent({ a, b }: { a: SharedRide; b: SharedRide }): ReactElement {
  const [style, setStyle] = useState<TogetherStyle>(startingStyle(a));
  const [theme, setTheme] = useState<RideTheme>(a.theme);
  const scroller = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const { aligned, rides } = useMemo(() => composeTogether([a, b], style, theme), [a, b, style, theme]);
  const names = [a.title.trim() || FALLBACK_NAMES[0], b.title.trim() || FALLBACK_NAMES[1]] as const;
  const playback = useTogetherPlayback({ tracks: [rides[0].track, rides[1].track], columns: aligned.columns, scroller, drawing });
  const column = playback.columnIndex === null ? null : aligned.columns[playback.columnIndex];
  const eventA = column?.a == null ? null : a.events[column.a];
  const eventB = column?.b == null ? null : b.events[column.b];
  const shared = sharedMoments(aligned.columns);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Riding together</h1>
      <p className="wrap-anywhere text-lg">
        {names[0]} and {names[1]}, with the same years lined up.
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
        highlighted={[eventA?.id ?? null, eventB?.id ?? null]}
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
          moments={column ? [{ name: names[0], event: eventA }, { name: names[1], event: eventB }] : null}
          sharedYears={shared.length}
          onTogglePause={playback.togglePause}
          onNext={playback.next}
          onBack={playback.back}
          onExit={playback.exit}
        />
      )}
      {shared.length > 0 && (
        <section aria-label="The same year, two stories" className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">The same year, two stories</h2>
          <ul className="flex flex-col gap-1">
            {shared.map((entry) => (
              <li key={entry.x} className="wrap-anywhere">
                <span className="font-semibold">{entry.date}:</span> {a.events[entry.a ?? 0].title} / {b.events[entry.b ?? 0].title}
              </li>
            ))}
          </ul>
        </section>
      )}
      <TogetherShare names={names} />
      <MakeYourOwn />
    </section>
  );
}

export function TogetherView(): ReactElement {
  const fragment = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => NO_FRAGMENT);
  const pair = useMemo(() => decodeTogether(fragment), [fragment]);
  if (pair === null) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">This ride together does not work</h1>
        <p>The link may have been cut short when it was copied. Ask for it again, or make a ride of your own.</p>
        <MakeYourOwn />
      </section>
    );
  }
  return <TogetherContent key={fragment} a={pair.a} b={pair.b} />;
}
