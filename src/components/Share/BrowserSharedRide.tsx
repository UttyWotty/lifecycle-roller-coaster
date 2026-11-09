/**
 * Browser-only entry to the shared ride view.
 * The ride lives in the link's fragment, which only the browser can read, so the server renders nothing for it.
 * Loading it in the browser alone keeps the server render and the browser from disagreeing.
 */
"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const SharedRideView = dynamic(
  () => import("./SharedRideView").then(({ SharedRideView: View }) => View),
  { ssr: false },
);

export function BrowserSharedRide(): ReactElement {
  return <SharedRideView />;
}
