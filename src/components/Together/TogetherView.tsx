/**
 * Ride together: two to four people's rides on one timeline, read from the link and shown side by side in time.
 * The rides share a style and theme the viewer can change, keep their own riders, and can be ridden together.
 * A link that is broken or not a group of rides shows a friendly message, and nothing from the link is saved.
 */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, type ReactElement } from "react";
import { CHOICE_PILL_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
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

const STYLES: readonly { id: TogetherStyle; name: MessageKey }[] = [
  { id: "coaster", name: "look.coasterName" },
  { id: "loops", name: "look.loopsName" },
];
/** What each ride is called when it has no title, in link order. */
const FALLBACK_NAMES: readonly MessageKey[] = ["together.firstRide", "together.secondRide", "together.thirdRide", "together.fourthRide"];
const PAIR = 2;
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
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/story" className={PRIMARY_LINK_CLASS}>
        {t("shared.makeOwn")}
      </Link>
      <Link href="/sample" className={`${SECONDARY_BUTTON_CLASS} inline-flex items-center`}>
        {t("landing.trySample")}
      </Link>
    </div>
  );
}

function TogetherContent({ shared: rideList }: { shared: readonly SharedRide[] }): ReactElement {
  const t = useT();
  const locale = useLocale();
  const [first] = rideList;
  const [style, setStyle] = useState<TogetherStyle>(startingStyle(first));
  const [theme, setTheme] = useState<RideTheme>(first.theme);
  const scroller = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const { aligned, rides } = useMemo(() => composeTogether(rideList, style, theme), [rideList, style, theme]);
  const names = rideList.map((ride, index) => ride.title.trim() || t(FALLBACK_NAMES[index]));
  const tracks = useMemo(() => rides.map(({ track }) => track), [rides]);
  const playback = useTogetherPlayback({ tracks, columns: aligned.columns, scroller, drawing });
  const column = playback.columnIndex === null ? null : aligned.columns[playback.columnIndex];
  const moments = rideList.map((ride, index) => {
    const entry = column?.entries[index] ?? null;
    return entry === null ? null : ride.events[entry];
  });
  const shared = sharedMoments(aligned.columns);
  const sharedHeading = t(rideList.length === PAIR ? "together.sharedPair" : "together.sharedGroup");

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("together.heading")}</h1>
      <p className="wrap-anywhere text-lg">{t("together.intro", { names: namesInWords(names, locale) })}</p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
        <fieldset className="min-w-0 lg:shrink-0">
          <legend className="sr-only">{t("together.styleLegend")}</legend>
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
                {t(option.name)}
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
            {t("together.start")}
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
  const t = useT();
  if (rides === null) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("together.brokenTitle")}</h1>
        <p>{t("together.brokenDetails")}</p>
        <MakeYourOwn />
      </section>
    );
  }
  return <TogetherContent key={fragment} shared={rides} />;
}
