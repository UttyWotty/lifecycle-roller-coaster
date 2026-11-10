/**
 * The My rides list: every ride saved on this device, newest first, with Open, Delete and a New ride button.
 * Delete asks once inline, never with a browser dialog, and deleting the open ride starts a new one.
 * It shows nothing until a ride is saved, and it follows the shelf in storage, so autosaves appear straight away.
 */
"use client";

import { useState, useSyncExternalStore, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useT, type Translate } from "@/components/I18n/useLocale";
import { MAX_SAVED_RIDES, isShelfFull, summarize, type RideSummary } from "@/lib/saved/rideShelf";
import { deleteRide, emptyShelf, loadShelf, subscribeToShelf } from "./rideStorage";

interface MyRidesProps {
  openId: string;
  onOpen: (id: string) => void;
  onNew: () => void;
}

const SINGLE_STOP = 1;
const DETAIL_SEPARATOR = " · ";

function yearSpan(first: number, last: number, t: Translate): string {
  return first === last ? String(first) : t("myRides.yearSpan", { first, last });
}

/** The ride's years and stop count, such as "2012 to 2026 · 5 stops", in the visitor's language. */
function rideDetails(ride: RideSummary, t: Translate): string {
  const { yearRange, stopCount } = ride;
  const years = yearRange === null ? null : yearSpan(yearRange.first, yearRange.last, t);
  const stops = t(stopCount === SINGLE_STOP ? "myRides.oneStop" : "myRides.manyStops", { count: stopCount });
  return [years, stops].filter(Boolean).join(DETAIL_SEPARATOR);
}

function RideRow({ ride, onOpen, onDelete }: { ride: RideSummary; onOpen: () => void; onDelete: () => void }): ReactElement {
  const [isConfirming, setIsConfirming] = useState(false);
  const t = useT();
  const details = rideDetails(ride, t);
  const name = ride.isUntitled ? t("myRides.untitled") : ride.name;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted/40 p-3">
      <div className="min-w-0">
        <p className="wrap-anywhere font-semibold">
          {name}
          {ride.isOpen && <span className="ml-2 text-sm font-normal text-muted">{t("myRides.openNow")}</span>}
        </p>
        <p className="text-sm text-muted">{details}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isConfirming ? (
          <>
            <p className="text-sm">{t("myRides.confirmDelete")}</p>
            <button type="button" onClick={onDelete} className={SECONDARY_BUTTON_CLASS} aria-label={t("myRides.yesDeleteLabel", { name })}>
              {t("myRides.yesDelete")}
            </button>
            <button type="button" onClick={() => setIsConfirming(false)} className={SECONDARY_BUTTON_CLASS}>
              {t("myRides.keepIt")}
            </button>
          </>
        ) : (
          <>
            {!ride.isOpen && (
              <button type="button" onClick={onOpen} className={SECONDARY_BUTTON_CLASS} aria-label={t("myRides.openLabel", { name })}>
                {t("myRides.open")}
              </button>
            )}
            <button type="button" onClick={() => setIsConfirming(true)} className={SECONDARY_BUTTON_CLASS} aria-label={t("myRides.deleteLabel", { name })}>
              {t("myRides.delete")}
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function MyRides({ openId, onOpen, onNew }: MyRidesProps): ReactElement | null {
  const shelf = useSyncExternalStore(subscribeToShelf, loadShelf, emptyShelf);
  const t = useT();
  const rides = summarize({ ...shelf, activeId: openId });
  if (rides.length === 0) {
    return null;
  }
  const isFull = isShelfFull(shelf);

  function remove(id: string): void {
    deleteRide(id);
    if (id === openId) {
      onNew();
    }
  }

  return (
    <section aria-labelledby="my-rides-heading" className="mt-10 flex flex-col gap-3 border-t border-muted/40 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="my-rides-heading" className="text-xl font-semibold">
          {t("myRides.heading")}
        </h2>
        <button type="button" onClick={onNew} disabled={isFull} className={SECONDARY_BUTTON_CLASS}>
          {t("myRides.newRide")}
        </button>
      </div>
      <p className="text-sm text-muted">{isFull ? t("myRides.fullNote", { max: MAX_SAVED_RIDES }) : t("myRides.privacyNote")}</p>
      <ul className="flex flex-col gap-2">
        {rides.map((ride) => (
          <RideRow key={ride.id} ride={ride} onOpen={() => onOpen(ride.id)} onDelete={() => remove(ride.id)} />
        ))}
      </ul>
    </section>
  );
}
