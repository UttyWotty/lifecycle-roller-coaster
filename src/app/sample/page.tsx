/**
 * Page that opens straight on a random sample life, with nothing to write.
 * It sets the page metadata and layout around the interactive flow.
 * Samples are built in, so this page never calls an AI provider.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { BrowserRideFlow } from "@/components/RideFlow/BrowserRideFlow";

export const metadata: Metadata = {
  title: "Try a sample life | Lifecycle Roller Coaster",
};

export default function SamplePage(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <BrowserRideFlow startWithSample />
    </main>
  );
}
