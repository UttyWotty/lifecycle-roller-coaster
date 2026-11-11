/**
 * Read-only view of a ride someone shared, decoded from the link's fragment in the browser.
 * The viewer can ride it, change its style and theme for themselves and download it, but nothing is saved anywhere.
 * A link that is broken or not a ride shows a friendly message instead.
 */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { CategoryLegend } from "@/components/RollerCoaster/CategoryLegend";
import { ExportButton } from "@/components/RollerCoaster/ExportButton";
import { RideVideoButton } from "@/components/RollerCoaster/RideVideoButton";
import { storyDrawingOf } from "@/components/RollerCoaster/storyImage";
import { useToday } from "@/components/RollerCoaster/useToday";
import { useT } from "@/components/I18n/useLocale";
import { pastStops, splitFuture } from "@/lib/track/futureStops";
import { GUESS_STYLES, guessStyle } from "@/lib/guess/guessGame";
import { GuessPanel } from "./GuessPanel";
import { useGuessGame } from "./useGuessGame";
import { LifeStatsPanel } from "@/components/RollerCoaster/LifeStatsPanel";
import { RideDrawing } from "@/components/RollerCoaster/RideDrawing";
import { RideLookBar } from "@/components/RollerCoaster/RideLookBar";
import { composeRide } from "@/lib/scene/composeRide";
import type { RideTheme } from "@/lib/scene/themes";
import { RideTogetherWithMine } from "@/components/Together/TogetherEntry";
import { decodeSharedRide, type SharedRide } from "@/lib/share/sharedRide";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";

const PRIMARY_LINK_CLASS = "inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-2 font-semibold text-on-accent";
const NO_FRAGMENT = "";
const PRIMARY_BUTTON_CLASS = "min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent";
const GAME_KEY = "guess";
const RIDE_KEY = "ride";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
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

function SharedRideContent({ ride }: { ride: SharedRide }): ReactElement {
  const [style, setStyle] = useState<RideStyle>(ride.style);
  const [theme, setTheme] = useState<RideTheme>(ride.theme);
  const [fitToScreen, setFitToScreen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const today = useToday();
  const t = useT();
  const guessIds = useMemo(() => splitFuture(ride.events, today).past.map(({ id }) => id), [ride, today]);
  const game = useGuessGame(guessIds, ride.events);
  /** A game is drawn in a style that can hide its answers; the chosen style comes back when it ends. */
  const shownStyle = game.isPlaying ? guessStyle(style) : style;
  const { track, scene } = useMemo(
    () => composeRide(ride.events, { style: shownStyle, theme, title: ride.title, rider: ride.rider, chapters: ride.chapters, today }),
    [ride, shownStyle, theme, today],
  );
  const guessing = game.isPlaying ? ride.events.find(({ id }) => id === guessIds[game.index]) ?? null : null;
  return (
    <section className="flex flex-col gap-4">
      <h1 className="wrap-anywhere text-3xl font-bold">{ride.title.trim() || t("shared.untitled")}</h1>
      <p className="rounded-lg border border-muted p-4 text-sm">{t("shared.note")}</p>
      <RideLookBar
        style={shownStyle}
        styles={game.isPlaying ? GUESS_STYLES : RIDE_STYLES}
        theme={theme}
        onStyleChange={setStyle}
        onThemeChange={setTheme}
      />
      {!game.isPlaying && guessIds.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-muted p-4">
          <p className="font-semibold">{t("shared.guessInvite")}</p>
          <div>
            <button type="button" onClick={game.start} className={PRIMARY_BUTTON_CLASS}>
              {t("shared.guessStart")}
            </button>
          </div>
        </div>
      )}
      <RideDrawing
        key={game.isPlaying ? GAME_KEY : RIDE_KEY}
        track={track}
        scene={scene}
        label={t(`look.${shownStyle}Drawing`)}
        events={ride.events}
        report={null}
        fitToScreen={fitToScreen}
        selectedId={game.isPlaying ? (game.revealed === null ? null : (guessing?.id ?? null)) : selectedId}
        svgRef={svg}
        onSelect={setSelectedId}
        onFitToScreenChange={setFitToScreen}
        curtain={game.curtainOn(pastStops(track))}
      />
      {game.isPlaying ? (
        <GuessPanel game={game} event={guessing} stopCount={guessIds.length} title={ride.title} />
      ) : (
        <>
          {scene?.palette.kind !== "line" && <CategoryLegend events={ride.events} />}
          <ExportButton
            svg={svg}
            width={track.width}
            height={track.height}
            story={{ drawing: storyDrawingOf(track, scene), title: ride.title, events: ride.events }}
            shareRide={{ ...ride, style, theme }}
          />
          <RideVideoButton svg={svg} track={track} events={ride.events} title={ride.title} isMonochrome={scene?.palette.kind === "line"} sceneryKind={scene?.palette.kind ?? null} />
          <LifeStatsPanel events={splitFuture(ride.events, today).past} />
        </>
      )}
      <RideTogetherWithMine theirs={ride} />
      <MakeYourOwn />
    </section>
  );
}

export function SharedRideView(): ReactElement {
  const fragment = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => NO_FRAGMENT);
  const ride = useMemo(() => decodeSharedRide(fragment), [fragment]);
  const t = useT();
  if (ride === null) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("shared.brokenTitle")}</h1>
        <p>{t("shared.brokenDetails")}</p>
        <MakeYourOwn />
      </section>
    );
  }
  return <SharedRideContent key={fragment} ride={ride} />;
}
