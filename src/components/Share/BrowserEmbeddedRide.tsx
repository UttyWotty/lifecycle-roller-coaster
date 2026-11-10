/**
 * Browser-only entry to the embedded ride view, used by the embed page.
 * The ride lives in the address's fragment, which only the browser can read.
 * Loading it in the browser alone keeps the server render and the browser from disagreeing.
 */
"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const EmbeddedRideView = dynamic(
  () => import("./EmbeddedRideView").then(({ EmbeddedRideView: View }) => View),
  { ssr: false },
);

export function BrowserEmbeddedRide(): ReactElement {
  return <EmbeddedRideView />;
}
