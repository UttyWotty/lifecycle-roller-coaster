/**
 * The My rides list: every ride saved on this device, newest first, with Open, Delete and a New ride button.
 * Delete asks once inline, never with a browser dialog, and deleting the open ride starts a new one.
 * It shows nothing until a ride is saved, and it follows the shelf in storage, so autosaves appear straight away.
 */
"use client";

import { useState, useSyncExternalStore, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { MAX_SAVED_RIDES, isShelfFull, summarize, type RideSummary } from "@/lib/saved/rideShelf";
import { deleteRide, emptyShelf, loadShelf, subscribeToShelf } from "./rideStorage";

interface MyRidesProps {
  openId: string;
  onOpen: (id: string) => void;
  onNew: () => void;
}

const FULL_NOTE = `You have ${MAX_SAVED_RIDES} rides, the most this device keeps. Delete one to make room for a new ride.`;
const PRIVACY_NOTE = "Saved on this device only. Your story text is never kept.";

function RideRow({ ride, onOpen, onDelete }: { ride: RideSummary; onOpen: () => void; onDelete: () => void }): ReactElement {
  const [isConfirming, setIsConfirming] = useState(false);
  const details = [ride.years, `${ride.stopCount} ${ride.stopCount === 1 ? "stop" : "stops"}`].filter(Boolean).join(" · ");
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted/40 p-3">
      <div className="min-w-0">
        <p className="wrap-anywhere font-semibold">
          {ride.name}
          {ride.isOpen && <span className="ml-2 text-sm font-normal text-muted">(open now)</span>}
        </p>
        <p className="text-sm text-muted">{details}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isConfirming ? (
          <>
            <p className="text-sm">Delete this ride from this device?</p>
            <button type="button" onClick={onDelete} className={SECONDARY_BUTTON_CLASS} aria-label={`Yes, delete ${ride.name}`}>
              Yes, delete
            </button>
            <button type="button" onClick={() => setIsConfirming(false)} className={SECONDARY_BUTTON_CLASS}>
              Keep it
            </button>
          </>
        ) : (
          <>
            {!ride.isOpen && (
              <button type="button" onClick={onOpen} className={SECONDARY_BUTTON_CLASS} aria-label={`Open ${ride.name}`}>
                Open
              </button>
            )}
            <button type="button" onClick={() => setIsConfirming(true)} className={SECONDARY_BUTTON_CLASS} aria-label={`Delete ${ride.name}`}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function MyRides({ openId, onOpen, onNew }: MyRidesProps): ReactElement | null {
  const shelf = useSyncExternalStore(subscribeToShelf, loadShelf, emptyShelf);
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
          My rides
        </h2>
        <button type="button" onClick={onNew} disabled={isFull} className={SECONDARY_BUTTON_CLASS}>
          New ride
        </button>
      </div>
      <p className="text-sm text-muted">{isFull ? FULL_NOTE : PRIVACY_NOTE}</p>
      <ul className="flex flex-col gap-2">
        {rides.map((ride) => (
          <RideRow key={ride.id} ride={ride} onOpen={() => onOpen(ride.id)} onDelete={() => remove(ride.id)} />
        ))}
      </ul>
    </section>
  );
}
