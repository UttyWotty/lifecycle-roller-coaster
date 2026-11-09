/**
 * Page that opens a ride someone shared as a link.
 * The ride is packed into the part of the link after "#", which is never sent to the server.
 * All behaviour lives in the browser-only SharedRideView.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { BrowserSharedRide } from "@/components/Share/BrowserSharedRide";

export const metadata: Metadata = {
  title: "A shared ride | Lifecycle Roller Coaster",
  description: "Someone shared their life as a roller coaster. Take the ride, then make your own.",
};

export default function SharedRidePage(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <BrowserSharedRide />
    </main>
  );
}
