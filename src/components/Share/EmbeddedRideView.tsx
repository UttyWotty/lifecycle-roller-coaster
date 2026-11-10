/**
 * Compact view of a shared ride for showing inside another website: its title, the drawing and Ride it.
 * The ride comes from the address's fragment with the same strict decoding as a share link, and nothing is saved.
 * Links back to this site open in a new tab, so the embedding page is never replaced.
 */
"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type ReactElement } from "react";
import { RideDrawing } from "@/components/RollerCoaster/RideDrawing";
import { useToday } from "@/components/RollerCoaster/useToday";
import { useT } from "@/components/I18n/useLocale";
import { composeRide } from "@/lib/scene/composeRide";
import { decodeSharedRide, type SharedRide } from "@/lib/share/sharedRide";
import { SHARED_RIDE_PATH } from "./ShareLinkPanel";

const NO_FRAGMENT = "";
const LINK_CLASS = "font-semibold text-accent underline underline-offset-2";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function MakeYourOwn({ fragment }: { fragment: string | null }): ReactElement {
  const t = useT();
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {fragment !== null && (
        <a href={`${SHARED_RIDE_PATH}${fragment}`} target="_blank" rel="noopener" className={LINK_CLASS}>
          {t("shared.openFull")}
        </a>
      )}
      <a href="/story" target="_blank" rel="noopener" className={LINK_CLASS}>
        {t("shared.embedMakeOwn")}
      </a>
    </p>
  );
}

function EmbeddedRide({ ride, fragment }: { ride: SharedRide; fragment: string }): ReactElement {
  const [fitToScreen, setFitToScreen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const today = useToday();
  const t = useT();
  const { track, scene } = useMemo(
    () => composeRide(ride.events, { style: ride.style, theme: ride.theme, title: ride.title, rider: ride.rider, chapters: ride.chapters, today }),
    [ride, today],
  );
  return (
    <section className="flex flex-col gap-3">
      <h1 className="wrap-anywhere text-xl font-bold">{ride.title.trim() || t("shared.untitled")}</h1>
      <RideDrawing
        track={track}
        scene={scene}
        label={t(`look.${ride.style}Drawing`)}
        events={ride.events}
        report={null}
        fitToScreen={fitToScreen}
        selectedId={selectedId}
        svgRef={svg}
        onSelect={setSelectedId}
        onFitToScreenChange={setFitToScreen}
        curtain={null}
      />
      <MakeYourOwn fragment={fragment} />
    </section>
  );
}

export function EmbeddedRideView(): ReactElement {
  const fragment = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => NO_FRAGMENT);
  const ride = useMemo(() => decodeSharedRide(fragment), [fragment]);
  const t = useT();
  if (ride === null) {
    return (
      <section className="flex flex-col gap-3">
        <p>{t("shared.embedBroken")}</p>
        <MakeYourOwn fragment={null} />
      </section>
    );
  }
  return <EmbeddedRide key={fragment} ride={ride} fragment={fragment} />;
}
