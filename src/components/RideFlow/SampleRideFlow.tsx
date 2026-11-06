/**
 * Browser-only entry to the ride flow that opens on a random sample life.
 * The choice is random, so rendering it on the server would not match the browser.
 * Loading it in the browser alone keeps the two from disagreeing.
 */
"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const RideFlow = dynamic(
  () => import("./RideFlow").then(({ RideFlow: Flow }) => Flow),
  { ssr: false },
);

export function SampleRideFlow(): ReactElement {
  return <RideFlow startWithSample />;
}
