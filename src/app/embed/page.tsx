/**
 * Page that shows a shared ride inside another website, through the snippet from Copy embed code.
 * The ride is packed into the part of the address after "#", which is never sent to the server.
 * It is the only page other sites may frame, and all behaviour lives in the browser-only EmbeddedRideView.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { BrowserEmbeddedRide } from "@/components/Share/BrowserEmbeddedRide";

export const metadata: Metadata = {
  title: "A ride | Lifecycle Roller Coaster",
  description: "A life told as a roller coaster. Take the ride, then make your own.",
  robots: { index: false },
};

export default function EmbedPage(): ReactElement {
  return (
    <main className="flex w-full flex-1 flex-col gap-3 p-3">
      <BrowserEmbeddedRide />
    </main>
  );
}
