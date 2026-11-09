/**
 * Page that shows two people's rides together on one timeline.
 * Both rides are packed into the part of the link after "#", which is never sent to the server.
 * All behaviour lives in the browser-only TogetherView.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { BrowserTogether } from "@/components/Together/BrowserTogether";

export const metadata: Metadata = {
  title: "Ride together | Lifecycle Roller Coaster",
  description: "Two lives as roller coasters, side by side in time. Take the ride together.",
};

export default function TogetherPage(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <BrowserTogether />
    </main>
  );
}
