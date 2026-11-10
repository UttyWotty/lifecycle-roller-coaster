/**
 * Chooses which ride the flow shows: the one open on this device, a new one, or a sample, and lists the other saved rides.
 * Switching rides remounts the flow with the new ride's id, so nothing from one ride can leak into another.
 * A sample opens under a fresh id, so a ride the user then makes from it is saved as a new ride, never over another.
 */
"use client";

import { useState, type ReactElement } from "react";
import { MyRides } from "./MyRides";
import { RideFlow } from "./RideFlow";
import { loadShelf, newRideId, rememberOpenRide } from "./rideStorage";

interface SavedRidesFlowProps {
  /** Opens on a random sample life instead of the user's saved ride or the empty story box. */
  startWithSample: boolean;
}

interface Opened {
  id: string;
  isSample: boolean;
}

function firstOpened(startWithSample: boolean): Opened {
  const activeId = startWithSample ? null : loadShelf().activeId;
  return { id: activeId ?? newRideId(), isSample: startWithSample };
}

export function SavedRidesFlow({ startWithSample }: SavedRidesFlowProps): ReactElement {
  const [opened, setOpened] = useState<Opened>(() => firstOpened(startWithSample));

  function open(id: string): void {
    rememberOpenRide(id);
    setOpened({ id, isSample: false });
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <RideFlow key={opened.id} rideId={opened.id} startWithSample={opened.isSample} />
      <MyRides openId={opened.id} onOpen={open} onNew={() => open(newRideId())} />
    </>
  );
}
