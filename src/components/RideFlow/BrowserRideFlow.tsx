/**
 * Browser-only entry to the ride flow, used by the story page and the sample page.
 * The flow reads the ride saved on the device and may pick a random sample, neither of which the server can know.
 * Loading it in the browser alone keeps the server render and the browser from disagreeing.
 */
"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const RideFlow = dynamic(
  () => import("./RideFlow").then(({ RideFlow: Flow }) => Flow),
  { ssr: false },
);

interface BrowserRideFlowProps {
  /** Opens on a random sample life instead of the user's saved ride or the empty story box. */
  startWithSample: boolean;
}

export function BrowserRideFlow({ startWithSample }: BrowserRideFlowProps): ReactElement {
  return <RideFlow startWithSample={startWithSample} />;
}
